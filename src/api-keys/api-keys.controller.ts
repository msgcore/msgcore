import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { AppAuthGuard } from '../common/guards/app-auth.guard';
import { ProjectAccessGuard } from '../common/guards/project-access.guard';
import { RequireScopes } from '../common/decorators/scopes.decorator';
import { SdkContract } from '../common/decorators/sdk-contract.decorator';
import { AuthContextParam } from '../common/decorators/auth-context.decorator';
import type { AuthContext } from '../common/utils/security.util';
import { Throttle } from '@nestjs/throttler';
import { ApiScope } from '../common/enums/api-scopes.enum';

@Controller('api/v1/projects/:project/keys')
@UseGuards(AppAuthGuard, ProjectAccessGuard)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @RequireScopes(ApiScope.KEYS_WRITE)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 key creations per minute
  @SdkContract({
    command: 'keys create',
    description: 'Generate a new API key',
    category: 'ApiKeys',
    requiredScopes: [ApiScope.KEYS_WRITE],
    inputType: 'CreateApiKeyDto',
    outputType: 'ApiKeyResponse',
    options: {
      name: { required: true, description: 'API key name', type: 'string' },
      scopes: {
        required: true,
        description:
          'Array of scope strings (e.g., ["messages:read", "messages:write"])',
        type: 'array',
      },
      expiresInDays: { description: 'Expiration in days', type: 'number' },
    },
    examples: [
      {
        description: 'Create messaging API key',
        command:
          'msgcore keys create --name "Bot Key" --scopes "messages:send,messages:read"',
      },
    ],
  })
  create(
    @Param('project') project: string,
    @Body() createApiKeyDto: CreateApiKeyDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.apiKeysService.create(project, createApiKeyDto, authContext);
  }

  @Get()
  @RequireScopes(ApiScope.KEYS_READ)
  @SdkContract({
    command: 'keys list',
    description: 'List all API keys for project',
    category: 'ApiKeys',
    requiredScopes: [ApiScope.KEYS_READ],
    outputType: 'ApiKeyListResponse[]',
    examples: [
      {
        description: 'List all API keys',
        command: 'msgcore keys list',
      },
    ],
  })
  findAll(
    @Param('project') project: string,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.apiKeysService.findAll(project, authContext);
  }

  @Delete(':keyId')
  @RequireScopes(ApiScope.KEYS_WRITE)
  @SdkContract({
    command: 'keys revoke',
    description: 'Revoke an API key',
    category: 'ApiKeys',
    requiredScopes: [ApiScope.KEYS_WRITE],
    outputType: 'MessageResponse',
    options: {
      keyId: {
        required: true,
        description: 'API key ID to revoke',
        type: 'string',
      },
    },
    examples: [
      {
        description: 'Revoke an API key',
        command: 'msgcore keys revoke --keyId "key-123"',
      },
    ],
  })
  revoke(
    @Param('project') project: string,
    @Param('keyId') keyId: string,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.apiKeysService.revoke(project, keyId, authContext);
  }

  @Post(':keyId/roll')
  @HttpCode(200)
  @RequireScopes(ApiScope.KEYS_WRITE)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 key rolls per minute
  @SdkContract({
    command: 'keys roll',
    description: 'Roll an API key (generate new key, revoke old after 24h)',
    category: 'ApiKeys',
    requiredScopes: [ApiScope.KEYS_WRITE],
    outputType: 'ApiKeyRollResponse',
    options: {
      keyId: {
        required: true,
        description: 'API key ID to roll',
        type: 'string',
      },
    },
    examples: [
      {
        description: 'Roll an API key',
        command: 'msgcore keys roll --keyId "key-123"',
      },
    ],
  })
  roll(
    @Param('project') project: string,
    @Param('keyId') keyId: string,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.apiKeysService.roll(project, keyId, authContext);
  }
}
