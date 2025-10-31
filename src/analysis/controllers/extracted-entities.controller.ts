import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../../common/guards/app-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { AuthContextParam } from '../../common/decorators/auth-context.decorator';
import type { AuthContext } from '../../common/utils/security.util';
import { SdkContract } from '../../common/decorators/sdk-contract.decorator';
import { ApiScope } from '../../common/enums/api-scopes.enum';
import { ExtractedEntitiesService } from '../services/extracted-entities.service';

@Controller('api/v1/projects/:project/analysis/entities')
@UseGuards(AppAuthGuard, ProjectAccessGuard)
export class ExtractedEntitiesController {
  constructor(private readonly entitiesService: ExtractedEntitiesService) {}

  @Get()
  @SdkContract({
    command: 'analysis entities list',
    category: 'Analysis / Entities',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'ExtractedEntityResponse[]',
    description: 'List all extracted entities for a project with pagination and sorting',
  })
  async listEntities(
    @Param('project') projectId: string,
    @Query('runId') runId?: string,
    @Query('schemaId') schemaId?: string,
    @Query('chatId') chatId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @AuthContextParam() authContext?: AuthContext,
  ) {
    return this.entitiesService.findAll(
      projectId,
      {
        runId,
        schemaId,
        chatId,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined,
        sortBy,
        sortOrder,
      },
      authContext!,
    );
  }

  @Get(':id')
  @SdkContract({
    command: 'analysis entities get',
    category: 'Analysis / Entities',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'ExtractedEntityResponse',
    description: 'Get a specific extracted entity by ID',
  })
  async getEntity(
    @Param('project') projectId: string,
    @Param('id') entityId: string,
    @AuthContextParam() authContext?: AuthContext,
  ) {
    return this.entitiesService.findOne(projectId, entityId, authContext!);
  }
}
