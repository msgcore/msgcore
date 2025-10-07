import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WebhooksService } from './services/webhooks.service';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { UpdateWebhookDto } from './dto/update-webhook.dto';
import { QueryDeliveriesDto } from './dto/query-deliveries.dto';
import { AppAuthGuard } from '../common/guards/app-auth.guard';
import { ProjectAccessGuard } from '../common/guards/project-access.guard';
import { RequireScopes } from '../common/decorators/require-scopes.decorator';
import { AuthContextParam } from '../common/decorators/auth-context.decorator';
import type { AuthContext } from '../common/utils/security.util';
import { SdkContract } from '../common/decorators/sdk-contract.decorator';
import { WebhookEventType } from './types/webhook-event.types';
import { ApiScope } from '../common/enums/api-scopes.enum';

@Controller('api/v1/projects/:project/webhooks')
@UseGuards(AppAuthGuard, ProjectAccessGuard)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @RequireScopes(ApiScope.WEBHOOKS_WRITE)
  @SdkContract({
    command: 'webhooks create',
    description: 'Create a new webhook for event notifications',
    category: 'Webhooks',
    requiredScopes: [ApiScope.WEBHOOKS_WRITE],
    inputType: 'CreateWebhookDto',
    outputType: 'WebhookResponse',
    options: {
      name: {
        required: true,
        description: 'Friendly name for the webhook',
        type: 'string',
      },
      url: {
        required: true,
        description: 'Target URL for webhook delivery',
        type: 'string',
      },
      events: {
        required: true,
        description:
          'Events to subscribe to (comma-separated: message.received,message.sent,message.failed,button.clicked,reaction.added,reaction.removed)',
        type: 'array',
      },
      secret: {
        description: 'Custom webhook secret (auto-generated if not provided)',
        type: 'string',
      },
    },
    examples: [
      {
        description: 'Create webhook for all message events',
        command:
          'msgcore webhooks create --name "Production Webhook" --url "https://myapp.com/webhooks" --events "message.received,message.sent,message.failed"',
      },
      {
        description: 'Create webhook for reactions',
        command:
          'msgcore webhooks create --name "Reactions Webhook" --url "https://myapp.com/webhooks" --events "reaction.added,reaction.removed"',
      },
      {
        description: 'Create webhook for all events',
        command:
          'msgcore webhooks create --name "All Events" --url "https://myapp.com/webhooks" --events "message.received,message.sent,message.failed,button.clicked,reaction.added,reaction.removed"',
      },
    ],
  })
  async createWebhook(
    @Param('project') project: string,
    @Body() createWebhookDto: CreateWebhookDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.webhooksService.createWebhook(
      project,
      createWebhookDto,
      authContext,
    );
  }

  @Get()
  @RequireScopes(ApiScope.WEBHOOKS_READ)
  @SdkContract({
    command: 'webhooks list',
    description: 'List all webhooks for a project',
    category: 'Webhooks',
    requiredScopes: [ApiScope.WEBHOOKS_READ],
    outputType: 'WebhookResponse[]',
    examples: [
      {
        description: 'List all webhooks',
        command: 'msgcore webhooks list',
      },
    ],
  })
  async listWebhooks(
    @Param('project') project: string,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.webhooksService.listWebhooks(project, authContext);
  }

  @Get(':webhookId')
  @RequireScopes(ApiScope.WEBHOOKS_READ)
  @SdkContract({
    command: 'webhooks get',
    description: 'Get a specific webhook with delivery statistics',
    category: 'Webhooks',
    requiredScopes: [ApiScope.WEBHOOKS_READ],
    outputType: 'WebhookDetailResponse',
    options: {
      webhookId: {
        required: true,
        description: 'Webhook ID',
        type: 'string',
      },
    },
    examples: [
      {
        description: 'Get webhook details',
        command: 'msgcore webhooks get --webhookId "webhook-123"',
      },
    ],
  })
  async getWebhook(
    @Param('project') project: string,
    @Param('webhookId') webhookId: string,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.webhooksService.getWebhook(project, webhookId, authContext);
  }

  @Patch(':webhookId')
  @RequireScopes(ApiScope.WEBHOOKS_WRITE)
  @SdkContract({
    command: 'webhooks update',
    description: 'Update a webhook configuration',
    category: 'Webhooks',
    requiredScopes: [ApiScope.WEBHOOKS_WRITE],
    inputType: 'UpdateWebhookDto',
    outputType: 'WebhookResponse',
    options: {
      webhookId: {
        required: true,
        description: 'Webhook ID',
        type: 'string',
      },
      name: {
        description: 'New webhook name',
        type: 'string',
      },
      url: {
        description: 'New webhook URL',
        type: 'string',
      },
      events: {
        description: 'New events subscription',
        type: 'array',
      },
      isActive: {
        description: 'Enable or disable webhook',
        type: 'boolean',
      },
    },
    examples: [
      {
        description: 'Disable a webhook',
        command:
          'msgcore webhooks update --webhookId "webhook-123" --isActive false',
      },
      {
        description: 'Update webhook URL',
        command:
          'msgcore webhooks update --webhookId "webhook-123" --url "https://newurl.com/webhooks"',
      },
    ],
  })
  async updateWebhook(
    @Param('project') project: string,
    @Param('webhookId') webhookId: string,
    @Body() updateWebhookDto: UpdateWebhookDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.webhooksService.updateWebhook(
      project,
      webhookId,
      updateWebhookDto,
      authContext,
    );
  }

  @Delete(':webhookId')
  @RequireScopes(ApiScope.WEBHOOKS_WRITE)
  @SdkContract({
    command: 'webhooks delete',
    description: 'Delete a webhook',
    category: 'Webhooks',
    requiredScopes: [ApiScope.WEBHOOKS_WRITE],
    outputType: 'MessageResponse',
    options: {
      webhookId: {
        required: true,
        description: 'Webhook ID',
        type: 'string',
      },
    },
    examples: [
      {
        description: 'Delete a webhook',
        command: 'msgcore webhooks delete --webhookId "webhook-123"',
      },
    ],
  })
  async deleteWebhook(
    @Param('project') project: string,
    @Param('webhookId') webhookId: string,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.webhooksService.deleteWebhook(project, webhookId, authContext);
  }

  @Get(':webhookId/deliveries')
  @RequireScopes(ApiScope.WEBHOOKS_READ)
  @SdkContract({
    command: 'webhooks deliveries',
    description: 'List webhook delivery attempts with filtering',
    category: 'Webhooks',
    requiredScopes: [ApiScope.WEBHOOKS_READ],
    outputType: 'WebhookDeliveryListResponse',
    options: {
      webhookId: {
        required: true,
        description: 'Webhook ID',
        type: 'string',
      },
      event: {
        description: 'Filter by event type',
        type: 'string',
        choices: Object.values(WebhookEventType),
      },
      status: {
        description: 'Filter by delivery status',
        type: 'string',
        choices: ['pending', 'success', 'failed'],
      },
      limit: {
        description: 'Number of deliveries to return (1-100)',
        type: 'number',
        default: 50,
      },
      offset: {
        description: 'Number of deliveries to skip',
        type: 'number',
        default: 0,
      },
    },
    examples: [
      {
        description: 'List recent deliveries',
        command: 'msgcore webhooks deliveries --webhookId "webhook-123"',
      },
      {
        description: 'List failed deliveries',
        command:
          'msgcore webhooks deliveries --webhookId "webhook-123" --status failed',
      },
    ],
  })
  async getDeliveries(
    @Param('project') project: string,
    @Param('webhookId') webhookId: string,
    @Query() query: QueryDeliveriesDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.webhooksService.getDeliveries(
      project,
      webhookId,
      query,
      authContext,
    );
  }
}
