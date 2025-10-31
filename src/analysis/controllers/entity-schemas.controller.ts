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
import { EntitySchemaService } from '../services/entity-schema.service';
import { CreateEntitySchemaDto, EntitySchemaResponse } from '../dto';
import { AppAuthGuard } from '../../common/guards/app-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { AuthContextParam } from '../../common/decorators/auth-context.decorator';
import type { AuthContext } from '../../common/utils/security.util';
import { SdkContract } from '../../common/decorators/sdk-contract.decorator';
import { RequireScopes } from '../../common/decorators/scopes.decorator';
import { ApiScope } from '../../common/enums/api-scopes.enum';

@Controller('api/v1/projects/:project/analysis/schemas/entities')
@UseGuards(AppAuthGuard, ProjectAccessGuard)
export class EntitySchemasController {
  constructor(private readonly entitySchemaService: EntitySchemaService) {}

  @Post()
  @RequireScopes(ApiScope.PROJECTS_WRITE)
  @SdkContract({
    command: 'analysis schemas create',
    category: 'Analysis',
    requiredScopes: [ApiScope.PROJECTS_WRITE],
    inputType: 'CreateEntitySchemaDto',
    outputType: 'EntitySchemaResponse',
    description: 'Create a new entity schema for custom extraction',
    options: {
      project: { type: 'string', description: 'Project ID', required: true },
      name: { type: 'string', description: 'Schema name', required: true },
      extractionType: {
        type: 'string',
        description: 'Extraction type (llm_extraction, rule_based, api_logged)',
        required: true,
      },
      properties: {
        type: 'string',
        description: 'JSON schema for entity properties',
        required: true,
      },
      prompt: { type: 'string', description: 'LLM prompt (for llm_extraction)' },
      description: { type: 'string', description: 'Schema description' },
    },
    examples: [
      {
        command:
          'analysis schemas create --project my-project --name Sentiment --extractionType llm_extraction --properties \'{"score":"number","label":"string"}\' --prompt "Analyze sentiment from -1 to 1"',
        description: 'Create a sentiment analysis schema',
      },
    ],
  })
  async create(
    @Param('project') projectId: string,
    @Body() dto: CreateEntitySchemaDto,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<EntitySchemaResponse> {
    return this.entitySchemaService.create(projectId, dto, authContext);
  }

  @Get()
  @RequireScopes(ApiScope.PROJECTS_READ)
  @SdkContract({
    command: 'analysis schemas list',
    category: 'Analysis',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'EntitySchemaResponse[]',
    description: 'List all entity schemas for a project',
    options: {
      project: { type: 'string', description: 'Project ID', required: true },
    },
    examples: [
      {
        command: 'analysis schemas list --project my-project',
        description: 'List all entity schemas',
      },
    ],
  })
  async findAll(
    @Param('project') projectId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<EntitySchemaResponse[]> {
    return this.entitySchemaService.findAll(projectId, authContext);
  }

  @Get(':schemaId')
  @RequireScopes(ApiScope.PROJECTS_READ)
  @SdkContract({
    command: 'analysis schemas get',
    category: 'Analysis',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'EntitySchemaResponse',
    description: 'Get a specific entity schema',
    options: {
      project: { type: 'string', description: 'Project ID', required: true },
      schemaId: { type: 'string', description: 'Schema ID', required: true },
    },
    examples: [
      {
        command: 'analysis schemas get --project my-project --schemaId abc123',
        description: 'Get entity schema details',
      },
    ],
  })
  async findOne(
    @Param('project') projectId: string,
    @Param('schemaId') schemaId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<EntitySchemaResponse> {
    return this.entitySchemaService.findOne(projectId, schemaId, authContext);
  }

  @Patch(':schemaId')
  @RequireScopes(ApiScope.PROJECTS_WRITE)
  @SdkContract({
    command: 'analysis schemas update',
    category: 'Analysis',
    requiredScopes: [ApiScope.PROJECTS_WRITE],
    inputType: 'Partial<CreateEntitySchemaDto>',
    outputType: 'EntitySchemaResponse',
    description: 'Update an entity schema',
    options: {
      project: { type: 'string', description: 'Project ID', required: true },
      schemaId: { type: 'string', description: 'Schema ID', required: true },
      name: { type: 'string', description: 'New schema name' },
      prompt: { type: 'string', description: 'New LLM prompt' },
    },
    examples: [
      {
        command:
          'analysis schemas update --project my-project --schemaId abc123 --prompt "New improved prompt"',
        description: 'Update schema prompt',
      },
    ],
  })
  async update(
    @Param('project') projectId: string,
    @Param('schemaId') schemaId: string,
    @Body() dto: Partial<CreateEntitySchemaDto>,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<EntitySchemaResponse> {
    return this.entitySchemaService.update(projectId, schemaId, dto, authContext);
  }

  @Delete(':schemaId')
  @RequireScopes(ApiScope.PROJECTS_WRITE)
  @SdkContract({
    command: 'analysis schemas delete',
    category: 'Analysis',
    requiredScopes: [ApiScope.PROJECTS_WRITE],
    outputType: 'void',
    description: 'Delete an entity schema (soft delete)',
    options: {
      project: { type: 'string', description: 'Project ID', required: true },
      schemaId: { type: 'string', description: 'Schema ID', required: true },
    },
    examples: [
      {
        command: 'analysis schemas delete --project my-project --schemaId abc123',
        description: 'Delete entity schema',
      },
    ],
  })
  async delete(
    @Param('project') projectId: string,
    @Param('schemaId') schemaId: string,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<void> {
    return this.entitySchemaService.delete(projectId, schemaId, authContext);
  }
}
