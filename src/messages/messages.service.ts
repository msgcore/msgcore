import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { SecurityUtil, AuthContext } from '../common/utils/security.util';
import { MessageDirection, MessageSource, MessageStatus } from '@prisma/client';

/**
 * Identity information returned from identity resolution
 */
export interface IdentityInfo {
  id: string;
  displayName: string | null;
  email: string | null;
}

/**
 * User information with optional identity
 */
export interface UserWithIdentity {
  id: string;
  name: string;
  identity: IdentityInfo | null;
}

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve identity for a message (platform user -> identity lookup)
   * @param projectId Project ID for security validation (defense-in-depth)
   * @param platformId Platform configuration ID
   * @param providerUserId Platform-specific user ID
   * @returns Identity information or null if not found
   *
   * Note: While the composite unique index (platformId, providerUserId) ensures
   * uniqueness, we validate projectId for defense-in-depth security.
   */
  private async resolveIdentityForMessage(
    projectId: string,
    platformId: string,
    providerUserId: string,
  ): Promise<IdentityInfo | null> {
    const alias = await this.prisma.identityAlias.findUnique({
      where: {
        platformId_providerUserId: {
          platformId,
          providerUserId,
        },
      },
      select: {
        projectId: true,
        identity: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    // Defense-in-depth: Validate project ownership
    if (!alias || alias.projectId !== projectId) {
      return null;
    }

    return alias.identity;
  }

  /**
   * Batch resolve identities for multiple platform users
   * @param projectId Project ID for security validation
   * @param users Array of platform users to resolve
   * @returns Map of "platformId:providerUserId" -> IdentityInfo
   *
   * Note: Uses a single database query with OR conditions for optimal performance.
   * Automatically deduplicates users before querying.
   */
  private async batchResolveIdentities(
    projectId: string,
    users: Array<{ platformId: string; providerUserId: string }>,
  ): Promise<Map<string, IdentityInfo>> {
    const identityMap = new Map<string, IdentityInfo>();

    if (users.length === 0) {
      return identityMap;
    }

    // Deduplicate users using Map (preserves insertion order, efficient lookup)
    // Use URL encoding to safely handle special characters (including ':') in IDs
    const uniqueUsersMap = new Map<
      string,
      { platformId: string; providerUserId: string }
    >();
    for (const user of users) {
      const key = `${encodeURIComponent(user.platformId)}:${encodeURIComponent(user.providerUserId)}`;
      uniqueUsersMap.set(key, user);
    }

    const uniqueUsers = Array.from(uniqueUsersMap.values());

    // Single database query with OR conditions for all users
    const aliases = await this.prisma.identityAlias.findMany({
      where: {
        AND: [
          { projectId }, // Defense-in-depth: filter by project
          {
            OR: uniqueUsers.map((u) => ({
              AND: [
                { platformId: u.platformId },
                { providerUserId: u.providerUserId },
              ],
            })),
          },
        ],
      },
      select: {
        platformId: true,
        providerUserId: true,
        identity: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    // Build map from results (use same encoding as key generation)
    for (const alias of aliases) {
      if (alias.identity) {
        const key = `${encodeURIComponent(alias.platformId)}:${encodeURIComponent(alias.providerUserId)}`;
        identityMap.set(key, alias.identity);
      }
    }

    this.logger.debug(
      `Resolved ${identityMap.size} identities for ${uniqueUsers.length} unique users in single query`,
    );

    return identityMap;
  }

  async getMessages(
    projectId: string,
    query: QueryMessagesDto,
    authContext: AuthContext,
  ) {
    // Get project and validate access in one step
    const project = await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'message retrieval',
    );

    // Build where clause for unified message table
    const where: any = {
      projectId: project.id,
    };

    if (query.platformId) {
      where.platformId = query.platformId;
    }

    if (query.chatId) {
      where.providerChatId = query.chatId;
    }

    if (query.userId) {
      where.providerUserId = query.userId;
    }

    if (query.direction) {
      where.direction = query.direction;
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        where.timestamp.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.timestamp.lte = new Date(query.endDate);
      }
    }

    // Build select clause
    const select = {
      id: true,
      platformId: true,
      providerMessageId: true,
      providerChatId: true,
      providerUserId: true,
      userDisplay: true,
      messageText: true,
      messageType: true,
      messageContent: true,
      timestamp: true,
      direction: true,
      status: true,
      errorMessage: true,
      attachments: true,
      platformConfig: {
        select: {
          name: true,
          platform: true,
        },
      },
      ...(query.raw === true && { rawData: true }),
    };

    // Get messages from unified table
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        select,
        orderBy: { timestamp: query.order },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.message.count({ where }),
    ]);

    // Transform messages to include backward-compatible fields
    const transformedMessages = messages.map((msg) => ({
      ...msg,
      platform: msg.platformConfig?.platform,
      platformName: msg.platformConfig?.name,
      chatId: msg.providerChatId,
      userId: msg.providerUserId,
    }));

    // Resolve identities for message users (senders for received, recipients for sent)
    if (transformedMessages.length > 0) {
      const usersToResolve = transformedMessages
        .filter((m) => m.userId) // Filter out messages without userId
        .map((m) => ({
          platformId: m.platformId,
          providerUserId: m.userId!,
        }));

      const identityMap = await this.batchResolveIdentities(
        project.id,
        usersToResolve,
      );

      // Attach identity to each message
      transformedMessages.forEach((message) => {
        if (message.userId) {
          const userKey = `${encodeURIComponent(message.platformId)}:${encodeURIComponent(message.userId)}`;
          (message as any).identity = identityMap.get(userKey) || null;
        } else {
          (message as any).identity = null;
        }
      });
    }

    // If reactions requested, fetch them for received messages only
    if (query.reactions && transformedMessages.length > 0) {
      const receivedMessagesOnly = transformedMessages.filter(
        (m) => m.direction === MessageDirection.received,
      );

      if (receivedMessagesOnly.length > 0) {
        const messageIds = receivedMessagesOnly
          .map((m) => m.providerMessageId)
          .filter((id): id is string => id !== null && id !== undefined); // Filter out null/undefined

        if (messageIds.length === 0) {
          // No messages with provider IDs, skip reactions
          transformedMessages.forEach((message) => {
            (message as any).reactions = {};
          });
          return {
            messages: transformedMessages,
            pagination: {
              total,
              limit: query.limit!,
              offset: query.offset!,
              hasMore: query.offset! + query.limit! < total,
            },
          };
        }

        // Get all reactions (both added and removed) to determine current state
        const allReactions = await this.prisma.receivedReaction.findMany({
          where: {
            projectId: project.id,
            platformId: { in: receivedMessagesOnly.map((m) => m.platformId) },
            providerMessageId: { in: messageIds },
          },
          select: {
            platformId: true,
            providerMessageId: true,
            providerUserId: true,
            userDisplay: true,
            emoji: true,
            reactionType: true,
            timestamp: true,
          },
          orderBy: { timestamp: 'desc' },
        });

        // Filter to only show reactions where the latest event is 'added'
        const reactionKey = (r: any) =>
          `${r.providerMessageId}:${r.providerUserId}:${r.emoji}`;
        const latestReactions = new Map<string, (typeof allReactions)[0]>();

        allReactions.forEach((reaction) => {
          const key = reactionKey(reaction);
          if (!latestReactions.has(key)) {
            latestReactions.set(key, reaction);
          }
        });

        // Only include reactions where latest state is 'added'
        const reactions = Array.from(latestReactions.values()).filter(
          (r) => r.reactionType === 'added',
        );

        // Batch resolve identities for all unique reaction users
        const reactionIdentityMap = await this.batchResolveIdentities(
          project.id,
          reactions.map((r) => ({
            platformId: r.platformId,
            providerUserId: r.providerUserId,
          })),
        );

        // Group reactions by message ID, then by emoji
        const reactionsByMessage = reactions.reduce(
          (acc, reaction) => {
            if (!acc[reaction.providerMessageId]) {
              acc[reaction.providerMessageId] = {};
            }
            if (!acc[reaction.providerMessageId][reaction.emoji]) {
              acc[reaction.providerMessageId][reaction.emoji] = [];
            }
            // Resolve identity for reaction user
            const userKey = `${encodeURIComponent(reaction.platformId)}:${encodeURIComponent(reaction.providerUserId)}`;
            const identity = reactionIdentityMap.get(userKey) || null;
            // Store user with identity info
            acc[reaction.providerMessageId][reaction.emoji].push({
              id: reaction.providerUserId,
              name: reaction.userDisplay || reaction.providerUserId,
              identity,
            });
            return acc;
          },
          {} as Record<string, Record<string, UserWithIdentity[]>>,
        );

        // Attach reactions to messages in clean format: { "👍": [{ id: "123", name: "John", identity: {...} }], "❤️": [...] }
        transformedMessages.forEach((message) => {
          (message as any).reactions = message.providerMessageId
            ? reactionsByMessage[message.providerMessageId] || {}
            : {};
        });
      }
    }

    return {
      messages: transformedMessages,
      pagination: {
        total,
        limit: query.limit!,
        offset: query.offset!,
        hasMore: query.offset! + query.limit! < total,
      },
    };
  }

  async getMessage(projectId: string, messageId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const message = await this.prisma.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        platformConfig: {
          select: {
            id: true,
            platform: true,
            isActive: true,
            testMode: true,
          },
        },
        attachments: true,
      },
    });

    if (!message || message.projectId !== project.id) {
      throw new NotFoundException('Message not found');
    }

    // Initialize empty reactions if no provider message ID
    if (!message.providerMessageId) {
      return {
        ...message,
        identity: null,
        reactions: {},
      };
    }

    // Fetch all reactions (both added and removed) to determine current state
    const allReactions = await this.prisma.receivedReaction.findMany({
      where: {
        projectId: project.id,
        platformId: message.platformId,
        providerMessageId: message.providerMessageId,
      },
      select: {
        platformId: true,
        providerUserId: true,
        userDisplay: true,
        emoji: true,
        reactionType: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    // Filter to only show reactions where the latest event is 'added'
    const reactionKey = (r: any) => `${r.providerUserId}:${r.emoji}`;
    const latestReactions = new Map<string, (typeof allReactions)[0]>();

    allReactions.forEach((reaction) => {
      const key = reactionKey(reaction);
      if (!latestReactions.has(key)) {
        latestReactions.set(key, reaction);
      }
    });

    // Only include reactions where latest state is 'added'
    const reactions = Array.from(latestReactions.values()).filter(
      (r) => r.reactionType === 'added',
    );

    // Batch resolve identities for all unique reaction users
    const reactionIdentityMap = await this.batchResolveIdentities(
      project.id,
      reactions.map((r) => ({
        platformId: r.platformId,
        providerUserId: r.providerUserId,
      })),
    );

    // Group reactions by emoji
    const groupedReactions = reactions.reduce(
      (acc, reaction) => {
        if (!acc[reaction.emoji]) {
          acc[reaction.emoji] = [];
        }
        // Resolve identity for reaction user
        const userKey = `${encodeURIComponent(reaction.platformId)}:${encodeURIComponent(reaction.providerUserId)}`;
        const identity = reactionIdentityMap.get(userKey) || null;
        acc[reaction.emoji].push({
          id: reaction.providerUserId,
          name: reaction.userDisplay || reaction.providerUserId,
          identity,
        });
        return acc;
      },
      {} as Record<string, UserWithIdentity[]>,
    );

    // Resolve identity for message sender
    const identity = await this.resolveIdentityForMessage(
      project.id,
      message.platformId,
      message.providerUserId,
    );

    return {
      ...message,
      identity,
      reactions: groupedReactions,
    };
  }

  async getMessageStats(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get received message stats
    const [receivedCount, receivedPlatformStats, recentReceivedMessages] = await Promise.all([
      // Total received message count
      this.prisma.message.count({
        where: {
          projectId: project.id,
          direction: MessageDirection.received,
        },
      }),
      // Received messages per platform
      this.prisma.message.groupBy({
        by: ['platformId'],
        where: {
          projectId: project.id,
          direction: MessageDirection.received,
        },
        _count: true,
      }),
      // Recent received messages (last 24 hours)
      this.prisma.message.count({
        where: {
          projectId: project.id,
          direction: MessageDirection.received,
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Get unique users and chats from received messages
    const [uniqueUsers, uniqueChats] = await Promise.all([
      this.prisma.message.findMany({
        where: {
          projectId: project.id,
          direction: MessageDirection.received,
        },
        select: { providerUserId: true },
        distinct: ['providerUserId'],
      }),
      this.prisma.message.findMany({
        where: {
          projectId: project.id,
          direction: MessageDirection.received,
        },
        select: { providerChatId: true },
        distinct: ['providerChatId'],
      }),
    ]);

    // Get platform info for stats
    const platforms = await this.prisma.projectPlatform.findMany({
      where: {
        id: { in: receivedPlatformStats.map((s) => s.platformId) },
      },
      select: {
        id: true,
        platform: true,
      },
    });

    const platformMap = new Map(platforms.map((p) => [p.id, p.platform]));

    // Get sent message stats
    const [sentCount, sentPlatformStats] = await Promise.all([
      this.prisma.message.count({
        where: {
          projectId: project.id,
          direction: MessageDirection.sent,
        },
      }),
      this.prisma.message.groupBy({
        by: ['platformId', 'status'],
        where: {
          projectId: project.id,
          direction: MessageDirection.sent,
        },
        _count: true,
      }),
    ]);

    return {
      received: {
        totalMessages: receivedCount,
        recentMessages: recentReceivedMessages,
        uniqueUsers: uniqueUsers.length,
        uniqueChats: uniqueChats.length,
        byPlatform: receivedPlatformStats.map((stat) => ({
          platform: platformMap.get(stat.platformId) || 'unknown',
          count: stat._count,
        })),
      },
      sent: {
        totalMessages: sentCount,
        byPlatformAndStatus: sentPlatformStats.map((stat) => ({
          platform: platformMap.get(stat.platformId) || 'unknown',
          status: stat.status,
          count: stat._count,
        })),
      },
    };
  }

  async deleteOldMessages(projectId: string, daysBefore: number) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBefore);

    const deleted = await this.prisma.message.deleteMany({
      where: {
        projectId: project.id,
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    return {
      message: `Deleted ${deleted.count} messages older than ${daysBefore} days`,
      deletedCount: deleted.count,
    };
  }

}
