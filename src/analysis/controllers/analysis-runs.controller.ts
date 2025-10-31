import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AnalysisRunService } from '../services/analysis-run.service';
import {
  CreateAnalysisRunDto,
  AnalysisRunResponse,
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
    examples: [
      {
        command: 'analysis runs create --project my-project --profileId abc123 --targetType message --targetIds \'["msg-1","msg-2"]\'',
        description: 'Run analysis on specific messages',
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

  @Get()
  @RequireScopes(ApiScope.PROJECTS_READ)
  @SdkContract({
    command: 'analysis runs list',
    category: 'Analysis / Runs',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'AnalysisRunResponse[]',
    description: 'List analysis runs for a project',
    examples: [
      {
        command: 'analysis runs list --project my-project',
        description: 'List all runs',
      },
    ],
  })
  async findAll(
    @Param('project') projectId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisRunResponse[]> {
    return this.runService.findAll(projectId, authContext);
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
}
