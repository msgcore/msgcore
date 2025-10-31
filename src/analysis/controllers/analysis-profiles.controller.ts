import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AnalysisProfileService } from '../services/analysis-profile.service';
import {
  CreateAnalysisProfileDto,
  UpdateAnalysisProfileDto,
  AnalysisProfileResponse,
} from '../dto';
import { AppAuthGuard } from '../../common/guards/app-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { AuthContextParam } from '../../common/decorators/auth-context.decorator';
import type { AuthContext } from '../../common/utils/security.util';
import { SdkContract } from '../../common/decorators/sdk-contract.decorator';
import { RequireScopes } from '../../common/decorators/scopes.decorator';
import { ApiScope } from '../../common/enums/api-scopes.enum';
import { MessageResponse } from '../../common/types/api-responses';

@Controller('api/v1/projects/:project/analysis/profiles')
@UseGuards(AppAuthGuard, ProjectAccessGuard)
export class AnalysisProfilesController {
  constructor(private readonly profileService: AnalysisProfileService) {}

  @Post()
  @RequireScopes(ApiScope.PROJECTS_WRITE)
  @SdkContract({
    command: 'analysis profiles create',
    category: 'Analysis / Profiles',
    requiredScopes: [ApiScope.PROJECTS_WRITE],
    inputType: 'CreateAnalysisProfileDto',
    outputType: 'AnalysisProfileResponse',
    description: 'Create a new analysis profile (versioned pipeline)',
    examples: [
      {
        command: 'analysis profiles create --project my-project --name "Sentiment Analysis" --graphDefinition \'{"nodes":[]}\' --entitySchemaIds \'["schema-1"]\'',
        description: 'Create an analysis profile',
      },
    ],
  })
  async create(
    @Param('project') projectId: string,
    @Body() dto: CreateAnalysisProfileDto,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisProfileResponse> {
    return this.profileService.create(projectId, dto, authContext);
  }

  @Get()
  @RequireScopes(ApiScope.PROJECTS_READ)
  @SdkContract({
    command: 'analysis profiles list',
    category: 'Analysis / Profiles',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'AnalysisProfileResponse[]',
    description: 'List all analysis profiles for a project',
    examples: [
      {
        command: 'analysis profiles list --project my-project',
        description: 'List all profiles',
      },
    ],
  })
  async findAll(
    @Param('project') projectId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisProfileResponse[]> {
    return this.profileService.findAll(projectId, authContext);
  }

  @Get(':profileId')
  @RequireScopes(ApiScope.PROJECTS_READ)
  @SdkContract({
    command: 'analysis profiles get',
    category: 'Analysis / Profiles',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'AnalysisProfileResponse',
    description: 'Get a specific analysis profile',
    examples: [
      {
        command: 'analysis profiles get --project my-project --profileId abc123',
        description: 'Get profile details',
      },
    ],
  })
  async findOne(
    @Param('project') projectId: string,
    @Param('profileId') profileId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisProfileResponse> {
    return this.profileService.findOne(projectId, profileId, authContext);
  }

  @Patch(':profileId')
  @RequireScopes(ApiScope.PROJECTS_WRITE)
  @SdkContract({
    command: 'analysis profiles update',
    category: 'Analysis / Profiles',
    requiredScopes: [ApiScope.PROJECTS_WRITE],
    inputType: 'UpdateAnalysisProfileDto',
    outputType: 'AnalysisProfileResponse',
    description: 'Update an analysis profile',
    examples: [
      {
        command: 'analysis profiles update --project my-project --profileId abc123 --triggerOnReceive true',
        description: 'Enable real-time trigger',
      },
    ],
  })
  async update(
    @Param('project') projectId: string,
    @Param('profileId') profileId: string,
    @Body() dto: UpdateAnalysisProfileDto,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<AnalysisProfileResponse> {
    return this.profileService.update(projectId, profileId, dto, authContext);
  }

  @Delete(':profileId')
  @RequireScopes(ApiScope.PROJECTS_WRITE)
  @SdkContract({
    command: 'analysis profiles delete',
    category: 'Analysis / Profiles',
    requiredScopes: [ApiScope.PROJECTS_WRITE],
    outputType: 'MessageResponse',
    description: 'Delete an analysis profile (soft delete)',
    examples: [
      {
        command: 'analysis profiles delete --project my-project --profileId abc123',
        description: 'Delete profile',
      },
    ],
  })
  async delete(
    @Param('project') projectId: string,
    @Param('profileId') profileId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<MessageResponse> {
    return this.profileService.delete(projectId, profileId, authContext);
  }
}
