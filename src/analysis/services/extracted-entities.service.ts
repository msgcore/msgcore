import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthContext, SecurityUtil } from '../../common/utils/security.util';

export interface ExtractedEntityResponse {
  id: string;
  projectId: string;
  entitySchemaId: string;
  entitySchemaName: string;
  runId: string;
  profileVersion: number;
  properties: Record<string, any>;
  identityId: string | null;
  chatId: string | null;
  sourceMessageIds: string[];
  isLatest: boolean;
  confidence: number | null;
  extractedAt: Date;
}

export interface EntityFilters {
  runId?: string;
  schemaId?: string;
  chatId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ExtractedEntitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    projectId: string,
    filters: EntityFilters,
    authContext: AuthContext,
  ): Promise<ExtractedEntityResponse[]> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'list extracted entities',
    );

    const where: any = { projectId };

    if (filters.runId) {
      where.runId = filters.runId;
    }

    if (filters.schemaId) {
      where.entitySchemaId = filters.schemaId;
    }

    if (filters.chatId) {
      where.chatId = filters.chatId;
    }

    // Validate sortBy field
    const validSortFields = ['extractedAt', 'confidence', 'isLatest'];
    const sortField = filters.sortBy && validSortFields.includes(filters.sortBy)
      ? filters.sortBy
      : 'extractedAt';
    const sortOrder = filters.sortOrder || 'desc';

    const entities = await this.prisma.extractedEntity.findMany({
      where,
      include: {
        entitySchema: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { [sortField]: sortOrder },
      take: filters.limit || 100,
      skip: filters.offset || 0,
    });

    return entities.map((e) => this.mapToResponse(e));
  }

  async findOne(
    projectId: string,
    entityId: string,
    authContext: AuthContext,
  ): Promise<ExtractedEntityResponse> {
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'get extracted entity',
    );

    const entity = await this.prisma.extractedEntity.findFirst({
      where: {
        id: entityId,
        projectId,
      },
      include: {
        entitySchema: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!entity) {
      throw new NotFoundException(`Entity ${entityId} not found`);
    }

    return this.mapToResponse(entity);
  }

  private mapToResponse(entity: any): ExtractedEntityResponse {
    return {
      id: entity.id,
      projectId: entity.projectId,
      entitySchemaId: entity.entitySchemaId,
      entitySchemaName: entity.entitySchema.name,
      runId: entity.runId,
      profileVersion: entity.profileVersion,
      properties: entity.properties as Record<string, any>,
      identityId: entity.identityId,
      chatId: entity.chatId,
      sourceMessageIds: entity.sourceMessageIds,
      isLatest: entity.isLatest,
      confidence: entity.confidence,
      extractedAt: entity.extractedAt,
    };
  }
}
