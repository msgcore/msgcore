import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PlatformsService } from './platforms.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';
import { AppAuthGuard } from '../common/guards/app-auth.guard';
import { ProjectAccessGuard } from '../common/guards/project-access.guard';
import { RequireScopes } from '../common/decorators/require-scopes.decorator';
import { SdkContract } from '../common/decorators/sdk-contract.decorator';
import { AuthContextParam } from '../common/decorators/auth-context.decorator';
import type { AuthContext } from '../common/utils/security.util';
import { ApiScope } from '../common/enums/api-scopes.enum';

@Controller('api/v1/projects/:project/platforms')
@UseGuards(AppAuthGuard, ProjectAccessGuard)
export class PlatformsController {
  constructor(private readonly platformsService: PlatformsService) {}

  @Post()
  @RequireScopes(ApiScope.PLATFORMS_WRITE)
  @SdkContract({
    command: 'platforms create',
    description: 'Configure a new platform integration',
    category: 'Platforms',
    requiredScopes: [ApiScope.PLATFORMS_WRITE],
    inputType: 'CreatePlatformDto',
    outputType: 'PlatformResponse',
    options: {
      platform: {
        required: true,
        description: 'Platform type',
        choices: ['discord', 'telegram', 'whatsapp-evo'],
        type: 'string',
      },
      name: {
        required: true,
        description: 'Friendly name for the platform instance',
        type: 'string',
      },
      description: {
        description: 'Optional description for the platform instance',
        type: 'string',
      },
      credentials: {
        required: true,
        description:
          'Platform credentials (JSON object). Use "msgcore platforms supported" to see required fields for each platform.',
        type: 'object',
      },
      isActive: {
        description: 'Enable platform',
        default: true,
        type: 'boolean',
      },
      testMode: {
        description: 'Enable test mode',
        default: false,
        type: 'boolean',
      },
    },
    examples: [
      {
        description: 'Add Discord bot',
        command:
          'msgcore platforms create --platform discord --name "Main Discord Bot" --credentials \'{"token":"YOUR_DISCORD_BOT_TOKEN"}\'',
      },
      {
        description: 'Add Telegram bot in test mode',
        command:
          'msgcore platforms create --platform telegram --name "Test Telegram Bot" --description "Bot for testing purposes" --credentials \'{"token":"YOUR_TELEGRAM_BOT_TOKEN"}\' --testMode true',
      },
      {
        description: 'Add WhatsApp Evolution API',
        command:
          'msgcore platforms create --platform whatsapp-evo --name "Production WhatsApp" --credentials \'{"evolutionApiUrl":"https://your-evolution-api.com","evolutionApiKey":"YOUR_EVOLUTION_API_KEY"}\'',
      },
    ],
  })
  create(
    @Param('project') project: string,
    @Body() createPlatformDto: CreatePlatformDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.platformsService.create(
      project,
      createPlatformDto,
      authContext,
    );
  }

  @Get()
  @RequireScopes(ApiScope.PLATFORMS_READ)
  @SdkContract({
    command: 'platforms list',
    description: 'List configured platforms for project',
    category: 'Platforms',
    requiredScopes: [ApiScope.PLATFORMS_READ],
    outputType: 'PlatformResponse[]',
    examples: [
      {
        description: 'List all platforms',
        command: 'msgcore platforms list',
      },
    ],
  })
  findAll(@Param('project') project: string) {
    return this.platformsService.findAll(project);
  }

  @Get(':id')
  @RequireScopes(ApiScope.PLATFORMS_READ)
  @SdkContract({
    command: 'platforms get',
    description: 'Get platform configuration details',
    category: 'Platforms',
    requiredScopes: [ApiScope.PLATFORMS_READ],
    outputType: 'PlatformResponse',
    options: {
      id: { required: true, description: 'Platform ID', type: 'string' },
    },
    examples: [
      {
        description: 'Get platform details',
        command: 'msgcore platforms get --id "platform-123"',
      },
    ],
  })
  findOne(@Param('project') project: string, @Param('id') id: string) {
    return this.platformsService.findOne(project, id);
  }

  @Patch(':id')
  @RequireScopes(ApiScope.PLATFORMS_WRITE)
  @SdkContract({
    command: 'platforms update',
    description: 'Update platform configuration',
    category: 'Platforms',
    requiredScopes: [ApiScope.PLATFORMS_WRITE],
    inputType: 'UpdatePlatformDto',
    outputType: 'PlatformResponse',
    options: {
      name: {
        description: 'Updated friendly name',
        type: 'string',
      },
      description: {
        description: 'Updated description',
        type: 'string',
      },
      credentials: {
        description: 'Updated credentials (JSON object)',
        type: 'object',
      },
      isActive: { description: 'Enable/disable platform', type: 'boolean' },
      testMode: { description: 'Enable/disable test mode', type: 'boolean' },
    },
    examples: [
      {
        description: 'Update platform name and description',
        command:
          'msgcore platforms update --project my-project --id platform-123 --name "Updated Bot Name" --description "New description"',
      },
      {
        description: 'Update Telegram bot token',
        command:
          'msgcore platforms update --project my-project --id platform-123 --credentials \'{"token":"YOUR_NEW_TELEGRAM_TOKEN"}\'',
      },
      {
        description: 'Disable platform',
        command:
          'msgcore platforms update --project my-project --id platform-123 --isActive false',
      },
      {
        description: 'Enable test mode',
        command:
          'msgcore platforms update --project my-project --id platform-123 --testMode true',
      },
    ],
  })
  update(
    @Param('project') project: string,
    @Param('id') id: string,
    @Body() updatePlatformDto: UpdatePlatformDto,
  ) {
    return this.platformsService.update(project, id, updatePlatformDto);
  }

  @Delete(':id')
  @RequireScopes(ApiScope.PLATFORMS_WRITE)
  @SdkContract({
    command: 'platforms delete',
    description: 'Remove platform configuration',
    category: 'Platforms',
    requiredScopes: [ApiScope.PLATFORMS_WRITE],
    outputType: 'MessageResponse',
    options: {
      id: { required: true, description: 'Platform ID', type: 'string' },
    },
    examples: [
      {
        description: 'Remove platform',
        command: 'msgcore platforms delete --id "platform-123"',
      },
    ],
  })
  remove(@Param('project') project: string, @Param('id') id: string) {
    return this.platformsService.remove(project, id);
  }

  @Post(':id/register-webhook')
  @RequireScopes(ApiScope.PLATFORMS_WRITE)
  @SdkContract({
    command: 'platforms register-webhook',
    description: 'Register webhook URL with platform provider',
    category: 'Platforms',
    requiredScopes: [ApiScope.PLATFORMS_WRITE],
    outputType: 'MessageResponse',
    options: {
      id: { required: true, description: 'Platform ID', type: 'string' },
    },
    examples: [
      {
        description: 'Register Telegram webhook',
        command: 'msgcore platforms register-webhook --id "platform-123"',
      },
    ],
  })
  async registerWebhook(
    @Param('project') project: string,
    @Param('id') id: string,
  ) {
    return this.platformsService.registerWebhook(project, id);
  }

  @Get(':id/qr-code')
  @RequireScopes(ApiScope.PLATFORMS_READ)
  @SdkContract({
    command: 'platforms qr-code',
    description: 'Get QR code for WhatsApp authentication',
    category: 'Platforms',
    requiredScopes: [ApiScope.PLATFORMS_READ],
    outputType: 'MessageResponse',
    options: {
      id: {
        required: true,
        description: 'WhatsApp Platform ID',
        type: 'string',
      },
    },
    examples: [
      {
        description: 'Get WhatsApp QR code',
        command: 'msgcore platforms qr-code --id "platform-123"',
      },
    ],
  })
  async getQRCode(@Param('project') project: string, @Param('id') id: string) {
    return this.platformsService.getQRCode(project, id);
  }
}
