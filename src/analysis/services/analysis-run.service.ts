import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  CreateAnalysisRunDto,
  AnalysisRunResponse,
} from '../dto';
import { AuthContext, SecurityUtil } from '../../common/utils/security.util';
import { EntityExtractionService } from './entity-extraction.service';
import { EntitySchemaDefinition } from './langgraph-builder.service';

@Injectable()
export class AnalysisRunService {
  private readonly logger = new Logger(AnalysisRunService.name);
  private readonly openrouterApiKey: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly extractionService: EntityExtractionService,
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

    // Create the run
    const run = await this.prisma.analysisRun.create({
      data: {
        projectId,
        profileId: profile.id,
        profileVersion: profile.version,
        targetType: dto.targetType,
        targetIds: dto.targetIds,
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
  ): Promise<AnalysisRunResponse[]> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'list analysis runs',
    );

    const runs = await this.prisma.analysisRun.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
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
        dto.targetType,
        dto.targetIds,
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

      // Process each message
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];

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

        // Extract entities using LangGraph
        const result = await this.extractionService.extractEntities(
          message.messageText || '',
          schemaDefinitions,
          this.openrouterApiKey,
        );

        // Store extracted entities
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
                sourceMessageIds: [message.id],
                identityId: null, // ReceivedMessage doesn't have identityId yet
                chatId: message.chatId,
                confidence: entity.confidence,
                isLatest: true,
              },
            });
            entitiesExtracted++;
          }
        }

        totalTokens += result.tokensUsed || 0;
        totalCost += this.estimateCost(result.tokensUsed || 0);

        // Update progress
        const progress = (i + 1) / messages.length;
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
          `Run ${runId}: Processed ${i + 1}/${messages.length} messages (${entitiesExtracted} entities)`,
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
    targetType: string,
    targetIds: string[],
    dateRangeStart?: string,
    dateRangeEnd?: string,
  ) {
    const where: any = { projectId };

    if (targetType === 'message') {
      where.id = { in: targetIds };
    } else if (targetType === 'chat') {
      where.chatId = { in: targetIds };
    } else if (targetType === 'identity') {
      where.identityId = { in: targetIds };
    } else if (targetType === 'date_range') {
      where.createdAt = {
        gte: dateRangeStart ? new Date(dateRangeStart) : undefined,
        lte: dateRangeEnd ? new Date(dateRangeEnd) : undefined,
      };
    }

    return this.prisma.receivedMessage.findMany({
      where,
      orderBy: { receivedAt: 'asc' },
      take: 1000, // Limit for safety
    });
  }

  private estimateCost(tokens: number): number {
    // Rough estimate: $3 per million tokens (Claude 3.5 Sonnet average)
    return (tokens / 1_000_000) * 3;
  }

  private mapToResponse(run: any): AnalysisRunResponse {
    return {
      id: run.id,
      projectId: run.projectId,
      profileId: run.profileId,
      profileVersion: run.profileVersion,
      targetType: run.targetType,
      targetIds: run.targetIds,
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
