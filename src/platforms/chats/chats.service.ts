import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SecurityUtil, AuthContext } from '../../common/utils/security.util';
import { ChatType } from '@prisma/client';

export interface ListChatsQuery {
  platformId?: string;
  chatType?: ChatType;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface SyncHistoryParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listChats(
    projectId: string,
    query: ListChatsQuery,
    authContext: AuthContext,
  ) {
    // Validate access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'list chats',
    );

    const where: any = { projectId };

    if (query.platformId) {
      where.platformId = query.platformId;
    }

    if (query.chatType) {
      where.chatType = query.chatType;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { providerChatId: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [chats, total] = await Promise.all([
      this.prisma.chat.findMany({
        where,
        include: {
          platformConfig: {
            select: {
              id: true,
              name: true,
              platform: true,
            },
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        take: query.limit || 50,
        skip: query.offset || 0,
      }),
      this.prisma.chat.count({ where }),
    ]);

    // Fetch all identities for this project to resolve names for user chats
    const identities = await this.prisma.identity.findMany({
      where: { projectId },
      include: {
        aliases: true,
      },
    });

    // Build lookup map: platformId:providerUserId -> Identity displayName
    const identityMap = new Map<string, string>();
    identities.forEach((identity) => {
      if (identity.displayName) {
        identity.aliases.forEach((alias) => {
          const key = `${alias.platformId}:${alias.providerUserId}`;
          identityMap.set(key, identity.displayName!);
        });
      }
    });

    return {
      chats: chats.map((chat) => {
        // For user chats, prioritize identity displayName over chat.name
        let displayName = chat.name;
        if (chat.chatType === ChatType.USER) {
          const key = `${chat.platformId}:${chat.providerChatId}`;
          const identityName = identityMap.get(key);
          // Use identity name if available, otherwise fall back to chat.name
          displayName = identityName || chat.name;
        }

        return {
          id: chat.id,
          providerChatId: chat.providerChatId,
          chatType: chat.chatType,
          name: displayName,
          avatarUrl: chat.avatarUrl,
          lastMessageAt: chat.lastMessageAt,
          lastSyncedAt: chat.lastSyncedAt,
          messageCount: chat._count.messages,
          platform: {
            id: chat.platformConfig.id,
            name: chat.platformConfig.name,
            type: chat.platformConfig.platform,
          },
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      }),
      pagination: {
        total,
        limit: query.limit || 50,
        offset: query.offset || 0,
      },
    };
  }

  async getChat(
    projectId: string,
    chatId: string,
    authContext: AuthContext,
  ) {
    // Validate access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'get chat',
    );

    const chat = await this.prisma.chat.findFirst({
      where: {
        id: chatId,
        projectId,
      },
      include: {
        platformConfig: {
          select: {
            id: true,
            name: true,
            platform: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException(`Chat ${chatId} not found`);
    }

    // For user chats, prioritize identity displayName over chat.name
    let displayName = chat.name;
    if (chat.chatType === ChatType.USER) {
      const alias = await this.prisma.identityAlias.findFirst({
        where: {
          projectId,
          platformId: chat.platformId,
          providerUserId: chat.providerChatId,
        },
        include: {
          identity: {
            select: {
              displayName: true,
            },
          },
        },
      });

      // Use identity name if available, otherwise fall back to chat.name
      if (alias?.identity?.displayName) {
        displayName = alias.identity.displayName;
      }
    }

    return {
      id: chat.id,
      providerChatId: chat.providerChatId,
      chatType: chat.chatType,
      name: displayName,
      avatarUrl: chat.avatarUrl,
      lastMessageAt: chat.lastMessageAt,
      lastSyncedAt: chat.lastSyncedAt,
      messageCount: chat._count.messages,
      platform: {
        id: chat.platformConfig.id,
        name: chat.platformConfig.name,
        type: chat.platformConfig.platform,
      },
      metadata: chat.metadata,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }

  async getChatMessages(
    projectId: string,
    chatId: string,
    limit: number = 50,
    offset: number = 0,
    authContext: AuthContext,
  ) {
    // Validate access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'get chat messages',
    );

    // Verify chat belongs to project
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, projectId },
    });

    if (!chat) {
      throw new NotFoundException(`Chat ${chatId} not found`);
    }

    // Fetch messages with proper database-level pagination
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { chatId },
        include: {
          attachments: true,
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.message.count({ where: { chatId } }),
    ]);

    return {
      messages,
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  async updateChatMetadata(
    projectId: string,
    chatId: string,
    data: {
      name?: string;
      avatarUrl?: string;
      metadata?: any;
    },
    authContext: AuthContext,
  ) {
    // Validate access
    await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'update chat',
    );

    // Verify chat belongs to project
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, projectId },
    });

    if (!chat) {
      throw new NotFoundException(`Chat ${chatId} not found`);
    }

    const updated = await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.metadata !== undefined && { metadata: data.metadata }),
      },
    });

    return updated;
  }
}
