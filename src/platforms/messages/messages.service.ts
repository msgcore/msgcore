import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SendMessageDto } from '../dto/send-message.dto';
import { SendReactionDto } from '../dto/send-reaction.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { MessageQueue } from '../../queues/message.queue';
import { PlatformsService } from '../platforms.service';
import { PlatformRegistry } from '../services/platform-registry.service';
import { SecurityUtil, AuthContext } from '../../common/utils/security.util';
import {
  ReactionType,
  Prisma,
  ChatType,
  MessageDirection,
  MessageSource,
  MessageStatus,
} from '@prisma/client';
import { WebhookDeliveryService } from '../../webhooks/services/webhook-delivery.service';
import { WebhookEventType } from '../../webhooks/types/webhook-event.types';
import { PlatformAttachment } from '../../messages/interfaces/message-attachment.interface';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    private readonly platformsService: PlatformsService,
    private readonly prisma: PrismaService,
    private readonly messageQueue: MessageQueue,
    private readonly platformRegistry: PlatformRegistry,
    private readonly webhookDeliveryService: WebhookDeliveryService,
  ) {}

  async sendMessage(projectId: string, sendMessageDto: SendMessageDto) {
    const targetCount = sendMessageDto.targets.length;
    const platformIds = sendMessageDto.targets.map((t) => t.platformId);

    this.logger.log(`Sending message to ${targetCount} targets`);

    // Get project and validate platforms
    const project = await this.getProject(projectId);
    for (const target of sendMessageDto.targets) {
      await this.platformsService.validatePlatformConfigById(target.platformId);
    }

    // Queue message for processing
    const queueResult = await this.messageQueue.addMessage({
      projectId: project.id,
      message: sendMessageDto,
    });

    this.logger.log(`Message queued - Job ID: ${queueResult.jobId}`);

    const response = {
      success: true,
      jobId: queueResult.jobId,
      status: queueResult.status,
      targets: sendMessageDto.targets,
      platformIds,
      timestamp: new Date().toISOString(),
      message: 'Message queued for delivery',
    };
    return response;
  }

  async getMessageStatus(jobId: string) {
    // Get job status from queue
    const jobStatus = await this.messageQueue.getJobStatus(jobId);
    if (!jobStatus) {
      throw new NotFoundException(`Job ${jobId} not found`);
    }

    // Get actual delivery results from database
    const deliveryResults = await this.prisma.message.findMany({
      where: {
        jobId,
        direction: MessageDirection.sent,
      },
      select: {
        id: true,
        platformId: true,
        providerChatId: true,
        providerUserId: true,
        status: true,
        errorMessage: true,
        providerMessageId: true,
        timestamp: true,
      },
    });

    // Calculate delivery summary
    const totalTargets = deliveryResults.length;
    const successfulDeliveries = deliveryResults.filter(
      (r) => r.status === MessageStatus.sent || r.status === MessageStatus.delivered,
    ).length;
    const failedDeliveries = deliveryResults.filter(
      (r) => r.status === MessageStatus.failed,
    ).length;
    const pendingDeliveries = deliveryResults.filter(
      (r) => r.status === MessageStatus.queued,
    ).length;

    // Determine overall status
    let overallStatus: 'completed' | 'failed' | 'partial' | 'pending';
    if (pendingDeliveries > 0) {
      overallStatus = 'pending';
    } else if (successfulDeliveries === totalTargets) {
      overallStatus = 'completed';
    } else if (failedDeliveries === totalTargets) {
      overallStatus = 'failed';
    } else {
      overallStatus = 'partial';
    }

    return {
      ...jobStatus,
      delivery: {
        overallStatus,
        summary: {
          totalTargets,
          successful: successfulDeliveries,
          failed: failedDeliveries,
          pending: pendingDeliveries,
        },
        results: deliveryResults,
        errors: deliveryResults
          .filter((r) => r.status === MessageStatus.failed && r.errorMessage)
          .map((r) => ({
            platformId: r.platformId,
            target: `${r.providerChatId}`,
            error: r.errorMessage,
          })),
      },
    };
  }

  async getQueueMetrics() {
    return this.messageQueue.getQueueMetrics();
  }

  async retryMessage(jobId: string) {
    return this.messageQueue.retryFailedJob(jobId);
  }

  async reactToMessage(
    projectId: string,
    reactionDto: SendReactionDto,
    authContext: AuthContext,
  ) {
    this.logger.log(
      `Adding reaction ${reactionDto.emoji} to message ${reactionDto.messageId}`,
    );

    // Prepare context (validates platform, ownership, gets provider)
    const { provider, connectionKey, platformConfig } =
      await this.prepareReactionContext(projectId, reactionDto, authContext);

    // Find message and determine origin
    const { chatId, fromMe } = await this.findMessageAndDetermineOrigin(
      reactionDto.messageId,
      reactionDto.platformId,
    );

    // Validate provider supports reactions
    if (!provider.sendReaction) {
      throw new BadRequestException(
        `Platform ${platformConfig.platform} does not support sending reactions`,
      );
    }

    // Send reaction
    await provider.sendReaction(
      connectionKey,
      chatId,
      reactionDto.messageId,
      reactionDto.emoji,
      fromMe,
    );

    this.logger.log(`Reaction sent successfully`);

    return {
      success: true,
      platformId: reactionDto.platformId,
      messageId: reactionDto.messageId,
      emoji: reactionDto.emoji,
      timestamp: new Date().toISOString(),
    };
  }

  async unreactToMessage(
    projectId: string,
    reactionDto: SendReactionDto,
    authContext: AuthContext,
  ) {
    this.logger.log(
      `Removing reaction ${reactionDto.emoji} from message ${reactionDto.messageId}`,
    );

    // Prepare context (validates platform, ownership, gets provider)
    const { provider, connectionKey, platformConfig } =
      await this.prepareReactionContext(projectId, reactionDto, authContext);

    // Find message and determine origin
    const { chatId, fromMe } = await this.findMessageAndDetermineOrigin(
      reactionDto.messageId,
      reactionDto.platformId,
    );

    // Validate provider supports unreact
    if (!provider.unreactFromMessage) {
      throw new BadRequestException(
        `Platform ${platformConfig.platform} does not support removing reactions`,
      );
    }

    // Remove reaction
    await provider.unreactFromMessage(
      connectionKey,
      chatId,
      reactionDto.messageId,
      reactionDto.emoji,
      fromMe,
    );

    this.logger.log(`Reaction removed successfully`);

    return {
      success: true,
      platformId: reactionDto.platformId,
      messageId: reactionDto.messageId,
      emoji: reactionDto.emoji,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Store incoming message from platform providers
   * Returns true if stored successfully, false if duplicate (P2002)
   * Identity resolution happens dynamically at query time via JOIN
   */
  async storeIncomingMessage(data: {
    projectId: string;
    platformId: string;
    platform: string;
    providerMessageId: string;
    providerChatId: string;
    providerUserId: string;
    userDisplay?: string;
    chatName?: string;
    messageText: string | null;
    messageType: string;
    fromMe?: boolean;
    timestamp?: Date;
    rawData: any;
    attachments?: PlatformAttachment[];
    skipIfExists?: boolean;
  }): Promise<boolean> {
    try {
      // Determine chat type from providerChatId format
      let chatType: ChatType = ChatType.user;
      if (data.providerChatId.includes('@g.us')) {
        chatType = ChatType.group;
      } else if (data.providerChatId.includes('@broadcast')) {
        chatType = ChatType.channel;
      }

      // Upsert chat first (create or update lastMessageAt)
      // NOTE: We NEVER overwrite existing chat names to preserve user-customized names
      const chat = await this.prisma.chat.upsert({
        where: {
          projectId_platformId_providerChatId: {
            projectId: data.projectId,
            platformId: data.platformId,
            providerChatId: data.providerChatId,
          },
        },
        create: {
          projectId: data.projectId,
          platformId: data.platformId,
          providerChatId: data.providerChatId,
          chatType,
          name: data.chatName || null,
          lastMessageAt: new Date(),
        },
        update: {
          lastMessageAt: new Date(),
          // NEVER update name on existing chats - preserves original names from webhooks
        },
      });

      // Check if message already exists (for conflict resolution during history sync)
      if (data.skipIfExists) {
        const existing = await this.prisma.message.findUnique({
          where: {
            platformId_providerMessageId: {
              platformId: data.platformId,
              providerMessageId: data.providerMessageId,
            },
          },
        });
        if (existing) {
          this.logger.debug(
            `Skipping existing message: ${data.providerMessageId}`,
          );
          return false;
        }
      }

      // Determine direction and source based on fromMe flag
      const direction = data.fromMe ? MessageDirection.sent : MessageDirection.received;
      const source = data.fromMe ? MessageSource.phone : MessageSource.webhook;

      const storedMessage = await this.prisma.message.create({
        data: {
          projectId: data.projectId,
          platformId: data.platformId,
          chatId: chat.id,
          direction,
          source,
          providerMessageId: data.providerMessageId,
          providerChatId: data.providerChatId,
          providerUserId: data.providerUserId,
          userDisplay: data.userDisplay,
          messageText: data.messageText,
          messageType: data.messageType,
          timestamp: data.timestamp || new Date(),
          rawData: data.rawData,
          ...(data.attachments && data.attachments.length > 0
            ? {
                attachments: {
                  create: data.attachments,
                },
              }
            : {}),
        },
      });

      this.logger.debug(
        `Stored message ${storedMessage.id} from ${data.userDisplay || data.providerUserId}`,
      );

      // Deliver webhook notification for incoming message
      await this.webhookDeliveryService.deliverEvent(
        data.projectId,
        WebhookEventType.MESSAGE_RECEIVED,
        {
          message_id: storedMessage.id,
          platform: data.platform,
          platform_id: data.platformId,
          chat_id: data.providerChatId,
          user_id: data.providerUserId,
          user_display: data.userDisplay ?? null,
          text: data.messageText,
          message_type: data.messageType,
          received_at: storedMessage.timestamp.toISOString(),
        },
      );

      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.debug(
          `Duplicate message ignored: ${data.providerMessageId} on platform ${data.platformId}`,
        );
        return false;
      }
      throw error;
    }
  }

  /**
   * Store incoming button click from platform providers
   * Returns true if stored successfully, false if duplicate (P2002)
   * Identity resolution happens dynamically at query time via JOIN
   */
  async storeIncomingButtonClick(data: {
    projectId: string;
    platformId: string;
    platform: string;
    providerMessageId: string;
    providerChatId: string;
    providerUserId: string;
    userDisplay?: string;
    buttonValue: string;
    rawData: any;
  }): Promise<boolean> {
    try {
      // Determine chat type from providerChatId format
      let chatType: ChatType = ChatType.user;
      if (data.providerChatId.includes('@g.us')) {
        chatType = ChatType.group;
      } else if (data.providerChatId.includes('@broadcast')) {
        chatType = ChatType.channel;
      }

      // Upsert chat first to ensure we have a valid chatId
      const chat = await this.prisma.chat.upsert({
        where: {
          projectId_platformId_providerChatId: {
            projectId: data.projectId,
            platformId: data.platformId,
            providerChatId: data.providerChatId,
          },
        },
        create: {
          projectId: data.projectId,
          platformId: data.platformId,
          providerChatId: data.providerChatId,
          chatType,
          name: null,
          lastMessageAt: new Date(),
        },
        update: {
          lastMessageAt: new Date(),
        },
      });

      const storedButton = await this.prisma.message.create({
        data: {
          projectId: data.projectId,
          platformId: data.platformId,
          chatId: chat.id,
          direction: MessageDirection.received,
          source: MessageSource.webhook,
          providerMessageId: data.providerMessageId,
          providerChatId: data.providerChatId,
          providerUserId: data.providerUserId,
          userDisplay: data.userDisplay,
          messageText: data.buttonValue,
          messageType: 'button_click',
          rawData: data.rawData,
        },
      });

      this.logger.debug(
        `Stored button click ${storedButton.id} from ${data.userDisplay || data.providerUserId}`,
      );

      // Deliver webhook notification for button click
      await this.webhookDeliveryService.deliverEvent(
        data.projectId,
        WebhookEventType.BUTTON_CLICKED,
        {
          message_id: storedButton.id,
          platform: data.platform,
          platform_id: data.platformId,
          chat_id: data.providerChatId,
          user_id: data.providerUserId,
          user_display: data.userDisplay ?? null,
          button_value: data.buttonValue,
          clicked_at: storedButton.timestamp.toISOString(),
        },
      );

      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.debug(
          `Duplicate button click ignored: ${data.providerMessageId} on platform ${data.platformId}`,
        );
        return false;
      }
      throw error;
    }
  }

  /**
   * Store incoming reaction from platform providers
   * Returns true if stored successfully, false if duplicate (P2002)
   * Identity resolution happens dynamically at query time via JOIN
   */
  async storeIncomingReaction(data: {
    projectId: string;
    platformId: string;
    platform: string;
    providerMessageId: string;
    providerChatId: string;
    providerUserId: string;
    userDisplay?: string;
    emoji: string;
    reactionType: ReactionType;
    rawData: any;
  }): Promise<boolean> {
    try {
      const storedReaction = await this.prisma.receivedReaction.create({
        data: {
          projectId: data.projectId,
          platformId: data.platformId,
          providerMessageId: data.providerMessageId,
          providerChatId: data.providerChatId,
          providerUserId: data.providerUserId,
          userDisplay: data.userDisplay,
          emoji: data.emoji,
          reactionType: data.reactionType,
          rawData: data.rawData,
        },
      });

      this.logger.debug(
        `Stored ${data.reactionType} reaction: ${data.emoji} by ${data.userDisplay || data.providerUserId}`,
      );

      // Deliver webhook notification
      const eventType =
        data.reactionType === ReactionType.added
          ? WebhookEventType.REACTION_ADDED
          : WebhookEventType.REACTION_REMOVED;

      await this.webhookDeliveryService.deliverEvent(
        data.projectId,
        eventType,
        {
          message_id: storedReaction.id,
          platform: data.platform,
          platform_id: data.platformId,
          chat_id: data.providerChatId,
          user_id: data.providerUserId,
          user_display: data.userDisplay ?? null,
          emoji: data.emoji,
          timestamp: storedReaction.timestamp.toISOString(),
          raw: {
            original_message_id: data.providerMessageId,
          },
        },
      );

      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.debug(
          `Duplicate ${data.reactionType} reaction ignored: ${data.emoji} on ${data.providerMessageId}`,
        );
        return false;
      }
      throw error;
    }
  }

  /**
   * Store phone-sent message (messages sent directly from WhatsApp mobile app)
   * Returns true if stored successfully, false if duplicate
   */
  async storePhoneSentMessage(data: {
    projectId: string;
    platformId: string;
    platform: string;
    providerMessageId: string;
    targetChatId: string;
    targetUserId?: string;
    targetType: string; // user, channel, group
    messageText: string | null;
    messageContent?: any;
    attachments?: PlatformAttachment[];
    rawData: any;
  }): Promise<boolean> {
    try {
      // Determine chat type from targetChatId format
      let chatType: ChatType = ChatType.user;
      if (data.targetChatId.includes('@g.us')) {
        chatType = ChatType.group;
      } else if (data.targetChatId.includes('@broadcast')) {
        chatType = ChatType.channel;
      }

      // Upsert chat first (create or update lastMessageAt)
      // This ensures chats are created when you send messages from your phone
      const chat = await this.prisma.chat.upsert({
        where: {
          projectId_platformId_providerChatId: {
            projectId: data.projectId,
            platformId: data.platformId,
            providerChatId: data.targetChatId,
          },
        },
        create: {
          projectId: data.projectId,
          platformId: data.platformId,
          providerChatId: data.targetChatId,
          chatType,
          name: null, // Will be filled by incoming messages or manual sync
          lastMessageAt: new Date(),
        },
        update: {
          lastMessageAt: new Date(),
        },
      });

      const storedMessage = await this.prisma.message.create({
        data: {
          projectId: data.projectId,
          platformId: data.platformId,
          chatId: chat.id,
          direction: MessageDirection.sent,
          source: MessageSource.phone,
          providerMessageId: data.providerMessageId,
          providerChatId: data.targetChatId,
          providerUserId: data.targetUserId || '',
          messageText: data.messageText,
          messageContent: data.messageContent
            ? JSON.parse(JSON.stringify(data.messageContent))
            : undefined,
          status: MessageStatus.sent,
          timestamp: new Date(),
          rawData: data.rawData,
          ...(data.attachments && data.attachments.length > 0
            ? {
                attachments: {
                  create: data.attachments,
                },
              }
            : {}),
        },
      });

      this.logger.debug(
        `Stored phone-sent message ${storedMessage.id} to ${data.targetChatId}`,
      );

      // Deliver webhook notification for phone-sent message
      await this.webhookDeliveryService.deliverEvent(
        data.projectId,
        WebhookEventType.MESSAGE_SENT,
        {
          message_id: storedMessage.id,
          job_id: null,
          platform: data.platform,
          platform_id: data.platformId,
          target: {
            type: data.targetType,
            chat_id: data.targetChatId,
            user_id: data.targetUserId ?? null,
          },
          text: data.messageText,
          source: 'phone',
          sent_at: storedMessage.timestamp.toISOString(),
        },
      );

      return true;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.debug(
          `Duplicate phone-sent message ignored: ${data.providerMessageId} on platform ${data.platformId}`,
        );
        return false;
      }
      throw error;
    }
  }

  /**
   * Helper: Prepare reaction context (validates platform, ownership, gets provider)
   */
  private async prepareReactionContext(
    projectId: string,
    reactionDto: SendReactionDto,
    authContext: AuthContext,
  ) {
    // Validate platform exists
    const platformConfig =
      await this.platformsService.validatePlatformConfigById(
        reactionDto.platformId,
      );

    // SECURITY: Get project and validate access (defense-in-depth)
    const project = await SecurityUtil.getProjectWithAccess(
      this.prisma,
      projectId,
      authContext,
      'send reactions',
    );

    // SECURITY: Validate platform belongs to project
    if (platformConfig.projectId !== project.id) {
      throw new BadRequestException(
        `Platform ${reactionDto.platformId} does not belong to project ${projectId}`,
      );
    }

    // Get provider for this platform
    const provider = this.platformRegistry.getProvider(platformConfig.platform);
    if (!provider) {
      throw new BadRequestException(
        `Provider not found for platform: ${platformConfig.platform}`,
      );
    }

    const connectionKey = `${project.id}:${platformConfig.id}`;

    return { provider, connectionKey, platformConfig };
  }

  /**
   * Helper: Find message in DB and determine if it's from us
   */
  private async findMessageAndDetermineOrigin(
    messageId: string,
    platformId: string,
  ): Promise<{ chatId: string; fromMe: boolean }> {
    const message = await this.prisma.message.findFirst({
      where: {
        providerMessageId: messageId,
        platformId: platformId,
      },
    });

    if (!message) {
      throw new NotFoundException(
        `Message ${messageId} not found on platform ${platformId}`,
      );
    }

    return {
      chatId: message.providerChatId,
      fromMe: message.direction === MessageDirection.sent,
    };
  }

  private async getProject(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project '${projectId}' not found`);
    }

    return project;
  }
}
