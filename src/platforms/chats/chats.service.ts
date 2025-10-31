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

    return {
      chats: chats.map((chat) => ({
        id: chat.id,
        providerChatId: chat.providerChatId,
        chatType: chat.chatType,
        name: chat.name,
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
      })),
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

    return {
      id: chat.id,
      providerChatId: chat.providerChatId,
      chatType: chat.chatType,
      name: chat.name,
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

    const [messages, total] = await Promise.all([
      this.prisma.receivedMessage.findMany({
        where: { chatId },
        include: {
          attachments: true,
        },
        orderBy: [
          { receivedAt: 'desc' },
          { id: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      this.prisma.receivedMessage.count({ where: { chatId } }),
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
