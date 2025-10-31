import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  CreateAnalysisRunDto,
  AnalysisRunResponse,
  AnalysisStatsResponse,
} from '../dto';
import { AuthContext, SecurityUtil } from '../../common/utils/security.util';
import { EntityExtractionService } from './entity-extraction.service';
import { EntitySchemaDefinition } from './langgraph-builder.service';
import { OpenRouterModelsService } from './openrouter-models.service';

@Injectable()
export class AnalysisRunService {
  private readonly logger = new Logger(AnalysisRunService.name);
  private readonly openrouterApiKey: string;
  private readonly cancelledRuns = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly extractionService: EntityExtractionService,
    private readonly modelsService: OpenRouterModelsService,
  ) {
    this.openrouterApiKey = this.configService.get<string>('OPENROUTER_API_KEY') || '';
  }

  async create(
    projectId: string,
    dto: CreateAnalysisRunDto,
    authContext: AuthContext,
  ): Promise<AnalysisRunResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'create analysis run',
    );

    // Get the profile
    const profile = await this.prisma.analysisProfile.findFirst({
      where: {
        id: dto.profileId,
        projectId,
        isActive: true,
      },
    });

    if (!profile) {
      throw new NotFoundException(`Profile ${dto.profileId} not found`);
    }

    // Get the entity schemas
    const schemas = await this.prisma.entitySchema.findMany({
      where: {
        id: { in: profile.entitySchemaIds },
        projectId,
        isActive: true,
      },
    });

    if (schemas.length === 0) {
      throw new BadRequestException('No active schemas found for this profile');
    }

    this.logger.log(
      `Creating analysis run for profile ${profile.name} v${profile.version} with ${schemas.length} schemas`,
    );

    // Validate that at least one target is specified
    const hasTargets =
      (dto.chatIds && dto.chatIds.length > 0) ||
      (dto.identityIds && dto.identityIds.length > 0) ||
      (dto.dateRangeStart && dto.dateRangeEnd);

    if (!hasTargets) {
      throw new BadRequestException(
        'At least one target must be specified: chatIds, identityIds, or dateRange'
      );
    }

    // Create the run
    const run = await this.prisma.analysisRun.create({
      data: {
        projectId,
        profileId: profile.id,
        profileVersion: profile.version,
        chatIds: dto.chatIds || [],
        identityIds: dto.identityIds || [],
        dateRangeStart: dto.dateRangeStart ? new Date(dto.dateRangeStart) : null,
        dateRangeEnd: dto.dateRangeEnd ? new Date(dto.dateRangeEnd) : null,
        status: 'pending',
        progress: 0,
      },
    });

    // Execute the run asynchronously
    this.executeRun(run.id, profile, schemas, dto).catch((error) => {
      this.logger.error(`Run ${run.id} execution failed: ${error.message}`);
    });

    return this.mapToResponse(run);
  }

  async findAll(
    projectId: string,
    authContext: AuthContext,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<AnalysisRunResponse[]> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'list analysis runs',
    );

    // Validate sortBy field
    const validSortFields = ['createdAt', 'startedAt', 'completedAt', 'status', 'progress', 'entitiesExtracted'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const runs = await this.prisma.analysisRun.findMany({
      where: { projectId },
      orderBy: { [sortField]: sortOrder },
      take: 100,
    });

    return runs.map((r) => this.mapToResponse(r));
  }

  async findOne(
    projectId: string,
    runId: string,
    authContext: AuthContext,
  ): Promise<AnalysisRunResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'get analysis run',
    );

    const run = await this.prisma.analysisRun.findFirst({
      where: {
        id: runId,
        projectId,
      },
    });

    if (!run) {
      throw new NotFoundException(`Run ${runId} not found`);
    }

    return this.mapToResponse(run);
  }

  async getStats(
    projectId: string,
    authContext: AuthContext,
  ): Promise<AnalysisStatsResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'get analysis stats',
    );

    const runs = await this.prisma.analysisRun.findMany({
      where: { projectId },
    });

    const stats: AnalysisStatsResponse = {
      totalRuns: runs.length,
      runsByStatus: {
        pending: runs.filter((r) => r.status === 'pending').length,
        running: runs.filter((r) => r.status === 'running').length,
        completed: runs.filter((r) => r.status === 'completed').length,
        failed: runs.filter((r) => r.status === 'failed').length,
        cancelled: runs.filter((r) => r.status === 'cancelled').length,
      },
      totalEntitiesExtracted: runs.reduce(
        (sum, r) => sum + (r.entitiesExtracted || 0),
        0,
      ),
      totalTokensUsed: runs.reduce((sum, r) => sum + (r.tokensUsed || 0), 0),
      totalEstimatedCostUsd: runs.reduce(
        (sum, r) => sum + (r.estimatedCostUsd || 0),
        0,
      ),
    };

    return stats;
  }

  private async executeRun(
    runId: string,
    profile: any,
    schemas: any[],
    dto: CreateAnalysisRunDto,
  ) {
    try {
      // Update status to running
      await this.prisma.analysisRun.update({
        where: { id: runId },
        data: {
          status: 'running',
          startedAt: new Date(),
        },
      });

      // Get messages to analyze
      const messages = await this.getTargetMessages(
        profile.projectId,
        dto.chatIds,
        dto.identityIds,
        dto.dateRangeStart,
        dto.dateRangeEnd,
      );

      this.logger.log(`Run ${runId}: Processing ${messages.length} messages`);

      if (messages.length === 0) {
        await this.prisma.analysisRun.update({
          where: { id: runId },
          data: {
            status: 'completed',
            progress: 1,
            completedAt: new Date(),
          },
        });
        return;
      }

      let totalTokens = 0;
      let totalCost = 0;
      let entitiesExtracted = 0;

      // Group messages by chat for conversation-aware analysis
      const messagesByChat = new Map<string, any[]>();
      for (const message of messages) {
        const chatId = message.chatId || 'no-chat';
        if (!messagesByChat.has(chatId)) {
          messagesByChat.set(chatId, []);
        }
        messagesByChat.get(chatId)!.push(message);
      }

      this.logger.log(
        `Run ${runId}: Grouped ${messages.length} messages into ${messagesByChat.size} conversations`,
      );

      // Convert schemas to EntitySchemaDefinition format
      const schemaDefinitions: EntitySchemaDefinition[] = schemas.map((s) => ({
        name: s.name,
        extractionType: s.extractionType,
        properties: s.properties as Record<string, any>,
        prompt: s.prompt,
        model: s.model,
        temperature: s.temperature,
        ruleDefinition: s.ruleDefinition as Record<string, any>,
      }));

      // Process each conversation
      let processedConversations = 0;
      const totalConversations = messagesByChat.size;

      for (const [chatId, chatMessages] of messagesByChat) {
        // Check for cancellation
        if (this.cancelledRuns.has(runId)) {
          this.logger.log(`Run ${runId} was cancelled, stopping execution`);
          this.cancelledRuns.delete(runId);
          return;
        }

        // Build conversation context
        const conversationText = chatMessages
          .map((msg, idx) => {
            const timestamp = new Date(msg.receivedAt).toISOString();
            const sender = msg.fromMe ? 'Agent' : (msg.userDisplay || 'User');
            return `[${timestamp}] ${sender}: ${msg.messageText || ''}`;
          })
          .join('\n');

        this.logger.debug(
          `Run ${runId}: Analyzing conversation ${chatId} with ${chatMessages.length} messages`,
        );

        // Extract entities from entire conversation
        const result = await this.extractionService.extractEntities(
          conversationText,
          schemaDefinitions,
          this.openrouterApiKey,
        );

        // Store extracted entities
        const messageIds = chatMessages.map((m) => m.id);
        for (const entity of result.entities) {
          const schema = schemas.find((s) => s.name === entity.schemaName);
          if (schema && profile.storeEntities) {
            await this.prisma.extractedEntity.create({
              data: {
                projectId: profile.projectId,
                entitySchemaId: schema.id,
                runId,
                profileVersion: profile.version,
                properties: entity.properties,
                sourceMessageIds: messageIds,
                identityId: null,
                chatId: chatId === 'no-chat' ? null : chatId,
                confidence: entity.confidence,
                isLatest: true,
              },
            });
            entitiesExtracted++;
          }
        }

        totalTokens += result.tokensUsed || 0;

        // Use the model from the first schema for cost estimation
        const modelUsed = schemaDefinitions[0]?.model || 'anthropic/claude-3.5-sonnet';
        const cost = await this.modelsService.estimateCost(result.tokensUsed || 0, modelUsed);
        totalCost += cost;

        // Update progress
        processedConversations++;
        const progress = processedConversations / totalConversations;
        await this.prisma.analysisRun.update({
          where: { id: runId },
          data: {
            progress,
            entitiesExtracted,
            tokensUsed: totalTokens,
            estimatedCostUsd: totalCost,
          },
        });

        this.logger.debug(
          `Run ${runId}: Processed ${processedConversations}/${totalConversations} conversations (${entitiesExtracted} entities)`,
        );
      }

      // Mark as completed
      await this.prisma.analysisRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          progress: 1,
          completedAt: new Date(),
          entitiesExtracted,
          tokensUsed: totalTokens,
          estimatedCostUsd: totalCost,
        },
      });

      this.logger.log(
        `Run ${runId}: Completed! Extracted ${entitiesExtracted} entities, used ${totalTokens} tokens (~$${totalCost.toFixed(4)})`,
      );
    } catch (error) {
      this.logger.error(`Run ${runId} failed: ${error.message}`, error.stack);

      await this.prisma.analysisRun.update({
        where: { id: runId },
        data: {
          status: 'failed',
          errorMessage: error.message,
          completedAt: new Date(),
        },
      });
    }
  }

  private async getTargetMessages(
    projectId: string,
    chatIds?: string[],
    identityIds?: string[],
    dateRangeStart?: string,
    dateRangeEnd?: string,
  ) {
    const where: any = { projectId };
    const andConditions: any[] = [];

    // Filter by chat IDs if specified
    if (chatIds && chatIds.length > 0) {
      andConditions.push({ chatId: { in: chatIds } });
    }

    // Filter by identity IDs if specified
    if (identityIds && identityIds.length > 0) {
      andConditions.push({ identityId: { in: identityIds } });
    }

    // Filter by date range if specified
    if (dateRangeStart && dateRangeEnd) {
      andConditions.push({
        receivedAt: {
          gte: new Date(dateRangeStart),
          lte: new Date(dateRangeEnd),
        },
      });
    }

    // Combine all conditions with AND logic
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    return this.prisma.receivedMessage.findMany({
      where,
      orderBy: { receivedAt: 'asc' },
      take: 10000, // Increased limit since we're filtering better
    });
  }

  async cancel(
    projectId: string,
    runId: string,
    authContext: AuthContext,
  ): Promise<AnalysisRunResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'cancel analysis run',
    );

    const run = await this.prisma.analysisRun.findFirst({
      where: {
        id: runId,
        projectId,
      },
    });

    if (!run) {
      throw new NotFoundException(`Run ${runId} not found`);
    }

    if (run.status !== 'pending' && run.status !== 'running') {
      throw new BadRequestException(
        `Cannot cancel run with status ${run.status}`,
      );
    }

    // Mark for cancellation
    this.cancelledRuns.add(runId);

    // Update database
    const updatedRun = await this.prisma.analysisRun.update({
      where: { id: runId },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
        errorMessage: 'Run cancelled by user',
      },
    });

    this.logger.log(`Run ${runId} cancelled`);

    return this.mapToResponse(updatedRun);
  }


  private mapToResponse(run: any): AnalysisRunResponse {
    return {
      id: run.id,
      projectId: run.projectId,
      profileId: run.profileId,
      profileVersion: run.profileVersion,
      chatIds: run.chatIds,
      identityIds: run.identityIds,
      dateRangeStart: run.dateRangeStart,
      dateRangeEnd: run.dateRangeEnd,
      status: run.status,
      progress: run.progress,
      entitiesExtracted: run.entitiesExtracted,
      errorMessage: run.errorMessage,
      tokensUsed: run.tokensUsed,
      estimatedCostUsd: run.estimatedCostUsd,
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      createdAt: run.createdAt,
    };
  }
}
