import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { AppAuthGuard } from '../../common/guards/app-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { AuthContextParam } from '../../common/decorators/auth-context.decorator';
import type { AuthContext } from '../../common/utils/security.util';
import { ListChatsDto } from './dto/list-chats.dto';
import { SyncHistoryDto } from './dto/sync-history.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PlatformRegistry } from '../services/platform-registry.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { MessagesService } from '../messages/messages.service';
import { SdkContract } from '../../common/decorators/sdk-contract.decorator';

@Controller('api/v1/projects/:project/chats')
@UseGuards(AppAuthGuard, ProjectAccessGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly platformRegistry: PlatformRegistry,
    private readonly prisma: PrismaService,
    private readonly messagesService: MessagesService,
  ) {}

  @Get()
  @SdkContract({
    command: 'chats list',
    description: 'List all chats for a project with filtering and pagination',
    category: 'Chats',
    inputType: 'ListChatsDto',
    options: {
      platformId: {
        description: 'Filter by platform ID',
        type: 'string',
      },
      chatType: {
        description: 'Filter by chat type (individual, group, channel)',
        type: 'string',
        choices: ['individual', 'group', 'channel'],
      },
      search: {
        description: 'Search chats by name or provider chat ID',
        type: 'string',
      },
      limit: {
        description: 'Number of chats to return',
        type: 'number',
        default: 50,
      },
      offset: {
        description: 'Number of chats to skip',
        type: 'number',
        default: 0,
      },
    },
  })
  async listChats(
    @Param('project') projectId: string,
    @Query() query: ListChatsDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.chatsService.listChats(projectId, query, authContext);
  }

  @Get(':chatId')
  @SdkContract({
    command: 'chats get',
    description: 'Get details of a specific chat',
    category: 'Chats',
    options: {
      chatId: {
        required: true,
        description: 'Chat ID',
        type: 'string',
      },
    },
  })
  async getChat(
    @Param('project') projectId: string,
    @Param('chatId') chatId: string,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.chatsService.getChat(projectId, chatId, authContext);
  }

  @Get(':chatId/messages')
  @SdkContract({
    command: 'chats messages',
    description: 'Get messages for a specific chat with pagination',
    category: 'Chats',
    options: {
      chatId: {
        required: true,
        description: 'Chat ID',
        type: 'string',
      },
      limit: {
        description: 'Number of messages to return',
        type: 'number',
        default: 50,
      },
      offset: {
        description: 'Number of messages to skip',
        type: 'number',
        default: 0,
      },
    },
  })
  async getChatMessages(
    @Param('project') projectId: string,
    @Param('chatId') chatId: string,
    @AuthContextParam() authContext: AuthContext,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.chatsService.getChatMessages(
      projectId,
      chatId,
      limit,
      offset,
      authContext,
    );
  }

  @Patch(':chatId')
  @SdkContract({
    command: 'chats update',
    description: 'Update chat metadata (name, avatar, custom metadata)',
    category: 'Chats',
    inputType: 'UpdateChatDto',
    options: {
      chatId: {
        required: true,
        description: 'Chat ID',
        type: 'string',
      },
      name: {
        description: 'Chat display name',
        type: 'string',
      },
      avatarUrl: {
        description: 'Chat avatar URL',
        type: 'string',
      },
      metadata: {
        description: 'Custom metadata (JSON string)',
        type: 'string',
      },
    },
  })
  async updateChat(
    @Param('project') projectId: string,
    @Param('chatId') chatId: string,
    @Body() updateDto: UpdateChatDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    return this.chatsService.updateChatMetadata(
      projectId,
      chatId,
      updateDto,
      authContext,
    );
  }

  @Post('sync-all')
  @HttpCode(HttpStatus.ACCEPTED)
  @SdkContract({
    command: 'chats sync-all',
    description: 'Sync all chats and their messages from all platforms',
    category: 'Chats',
    inputType: 'SyncHistoryDto',
    options: {
      platformId: {
        description: 'Optional: Sync only chats from specific platform',
        type: 'string',
      },
      startDate: {
        description: 'Start date for history sync (ISO 8601)',
        type: 'string',
      },
      endDate: {
        description: 'End date for history sync (ISO 8601)',
        type: 'string',
      },
      limit: {
        description: 'Maximum number of messages to sync per chat (1-1000)',
        type: 'number',
        default: 100,
      },
    },
  })
  async syncAllChats(
    @Param('project') projectId: string,
    @Body() syncDto: SyncHistoryDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    // Get all platforms for the project
    const platforms = await this.prisma.projectPlatform.findMany({
      where: {
        projectId,
        ...(syncDto.platformId ? { id: syncDto.platformId } : {}),
      },
    });

    const results: Array<{
      platformId: string;
      platform: string;
      status: 'success' | 'skipped' | 'failed';
      reason?: string;
      error?: string;
    }> = [];

    for (const platformConfig of platforms) {
      // Get provider
      const provider = this.platformRegistry.getProvider(
        platformConfig.platform,
      );

      if (!provider || !('syncAllChats' in provider)) {
        results.push({
          platformId: platformConfig.id,
          platform: platformConfig.platform,
          status: 'skipped',
          reason: 'Platform does not support sync-all',
        });
        continue;
      }

      try {
        const connectionKey = `${projectId}:${platformConfig.id}`;
        await (provider as any).syncAllChats(connectionKey, {
          startDate: syncDto.startDate ? new Date(syncDto.startDate) : undefined,
          endDate: syncDto.endDate ? new Date(syncDto.endDate) : undefined,
          limit: syncDto.limit,
        });

        results.push({
          platformId: platformConfig.id,
          platform: platformConfig.platform,
          status: 'success',
        });
      } catch (error) {
        results.push({
          platformId: platformConfig.id,
          platform: platformConfig.platform,
          status: 'failed',
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: 'Chat sync initiated for all platforms',
      results,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':chatId/sync')
  @HttpCode(HttpStatus.ACCEPTED)
  @SdkContract({
    command: 'chats sync',
    description: 'Sync historical messages for a specific chat from the platform provider',
    category: 'Chats',
    inputType: 'SyncHistoryDto',
    options: {
      chatId: {
        required: true,
        description: 'Chat ID',
        type: 'string',
      },
      startDate: {
        description: 'Start date for history sync (ISO 8601)',
        type: 'string',
      },
      endDate: {
        description: 'End date for history sync (ISO 8601)',
        type: 'string',
      },
      limit: {
        description: 'Maximum number of messages to sync (1-1000)',
        type: 'number',
        default: 100,
      },
    },
  })
  async syncChatHistory(
    @Param('project') projectId: string,
    @Param('chatId') chatId: string,
    @Body() syncDto: SyncHistoryDto,
    @AuthContextParam() authContext: AuthContext,
  ) {
    // Get chat to validate and get platform info
    const chat = await this.chatsService.getChat(
      projectId,
      chatId,
      authContext,
    );

    // Get platform config
    const platformConfig = await this.prisma.projectPlatform.findUnique({
      where: { id: chat.platform.id },
    });

    if (!platformConfig) {
      throw new Error('Platform configuration not found');
    }

    // Get provider
    const provider = this.platformRegistry.getProvider(
      platformConfig.platform,
    );

    if (!provider) {
      throw new Error(
        `Provider not found for platform: ${platformConfig.platform}`,
      );
    }

    // Check if provider supports history sync
    if (!('syncChatHistory' in provider)) {
      throw new Error(
        `Platform ${platformConfig.platform} does not support history sync`,
      );
    }

    // Decrypt credentials
    const credentials = JSON.parse(
      CryptoUtil.decrypt(platformConfig.credentialsEncrypted),
    );

    // Call provider's syncChatHistory method
    const connectionKey = `${projectId}:${platformConfig.id}`;
    await (provider as any).syncChatHistory(connectionKey, chat.providerChatId, {
      startDate: syncDto.startDate ? new Date(syncDto.startDate) : undefined,
      endDate: syncDto.endDate ? new Date(syncDto.endDate) : undefined,
      limit: syncDto.limit,
    });

    // Update lastSyncedAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastSyncedAt: new Date() },
    });

    return {
      success: true,
      message: 'Chat history sync initiated',
      chatId,
      timestamp: new Date().toISOString(),
    };
  }
}
