import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnalysisRunService } from '../services/analysis-run.service';
import {
  CreateAnalysisRunDto,
  AnalysisRunResponse,
  AnalysisStatsResponse,
} from '../dto';
import { AppAuthGuard } from '../../common/guards/app-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { AuthContextParam } from '../../common/decorators/auth-context.decorator';
import type { AuthContext } from '../../common/utils/security.util';
import { SdkContract } from '../../common/decorators/sdk-contract.decorator';
import { RequireScopes } from '../../common/decorators/scopes.decorator';
import { ApiScope } from '../../common/enums/api-scopes.enum';

@Controller('api/v1/projects/:project/analysis/runs')
@UseGuards(AppAuthGuard, ProjectAccessGuard)
export class AnalysisRunsController {
  constructor(private readonly runService: AnalysisRunService) {}

  @Post()
  @RequireScopes(ApiScope.PROJECTS_WRITE)
  @SdkContract({
    command: 'analysis runs create',
    category: 'Analysis / Runs',
    requiredScopes: [ApiScope.PROJECTS_WRITE],
    inputType: 'CreateAnalysisRunDto',
    outputType: 'AnalysisRunResponse',
    description: 'Execute an analysis run with a profile',
    options: {
      profileId: {
        required: true,
        description: 'Analysis profile ID',
        type: 'string',
      },
      chatIds: {
        description: 'Filter by chat IDs (JSON array)',
        type: 'array',
      },
      identityIds: {
        description: 'Filter by identity IDs (JSON array)',
        type: 'array',
      },
      dateRangeStart: {
        description: 'Start date for analysis (ISO 8601)',
        type: 'string',
      },
      dateRangeEnd: {
        description: 'End date for analysis (ISO 8601)',
        type: 'string',
      },
    },
    examples: [
      {
        command: 'analysis runs create --project my-project --profileId abc123 --chatIds \'["chat-1","chat-2"]\'',
        description: 'Run analysis on specific chats',
      },
    ],
  })
  async create(
    @Param('project') projectId: string,
    @Body() dto: CreateAnalysisRunDto,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisRunResponse> {
    return this.runService.create(projectId, dto, authContext);
  }

  @Get('stats')
  @RequireScopes(ApiScope.PROJECTS_READ)
  @SdkContract({
    command: 'analysis runs stats',
    category: 'Analysis / Runs',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'AnalysisStatsResponse',
    description: 'Get analysis run statistics for a project',
    examples: [
      {
        command: 'analysis runs stats --project my-project',
        description: 'Get run statistics',
      },
    ],
  })
  async getStats(
    @Param('project') projectId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisStatsResponse> {
    return this.runService.getStats(projectId, authContext);
  }

  @Get()
  @RequireScopes(ApiScope.PROJECTS_READ)
  @SdkContract({
    command: 'analysis runs list',
    category: 'Analysis / Runs',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'AnalysisRunResponse[]',
    description: 'List analysis runs for a project with sorting',
    examples: [
      {
        command: 'analysis runs list --project my-project',
        description: 'List all runs',
      },
      {
        command: 'analysis runs list --project my-project --sortBy status --sortOrder asc',
        description: 'List runs sorted by status',
      },
    ],
  })
  async findAll(
    @Param('project') projectId: string,
    @AuthContextParam() authContext: AuthContext,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ): Promise<AnalysisRunResponse[]> {
    return this.runService.findAll(projectId, authContext, sortBy, sortOrder);
  }

  @Get(':runId')
  @RequireScopes(ApiScope.PROJECTS_READ)
  @SdkContract({
    command: 'analysis runs get',
    category: 'Analysis / Runs',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'AnalysisRunResponse',
    description: 'Get analysis run status and results',
    examples: [
      {
        command: 'analysis runs get --project my-project --runId xyz789',
        description: 'Get run details',
      },
    ],
  })
  async findOne(
    @Param('project') projectId: string,
    @Param('runId') runId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisRunResponse> {
    return this.runService.findOne(projectId, runId, authContext);
  }

  @Post(':runId/cancel')
  @HttpCode(HttpStatus.OK)
  @RequireScopes(ApiScope.PROJECTS_WRITE)
  @SdkContract({
    command: 'analysis runs cancel',
    category: 'Analysis / Runs',
    requiredScopes: [ApiScope.PROJECTS_WRITE],
    outputType: 'AnalysisRunResponse',
    description: 'Cancel a running or pending analysis run',
    examples: [
      {
        command: 'analysis runs cancel --project my-project --runId xyz789',
        description: 'Cancel analysis run',
      },
    ],
  })
  async cancel(
    @Param('project') projectId: string,
    @Param('runId') runId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisRunResponse> {
    return this.runService.cancel(projectId, runId, authContext);
  }
}
