import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { Queue, Job } from 'bullmq';
import {
  MessageDirection,
  MessageSource,
  MessageStatus,
  ChatType,
} from '@prisma/client';
import { PlatformRegistry } from '../../platforms/services/platform-registry.service';
import { makeEnvelope } from '../../platforms/utils/envelope.factory';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoUtil } from '../../common/utils/crypto.util';
import { WebhookDeliveryService } from '../../webhooks/services/webhook-delivery.service';
import { WebhookEventType } from '../../webhooks/types/webhook-event.types';

// Matches SendMessageDto from API
interface MessageJob {
  projectId: string;
  message: {
    target: string; // Format: "platformId:type:id" or comma-separated
    text?: string;  // Simple text shortcut
    content?: {
      subject?: string;
      text?: string;
      markdown?: string;
      html?: string;
      attachments?: any[];
      buttons?: any[];
      embeds?: any[];
      platformOptions?: Record<string, any>;
    };
    options?: {
      replyTo?: string;
      silent?: boolean;
      scheduled?: string;
    };
    metadata?: {
      trackingId?: string;
      tags?: string[];
      priority?: string;
    };
  };
}

interface ParsedTarget {
  platformId: string;
  type: string;
  id: string;
}

@Injectable()
@Processor('messages')
export class DynamicMessageProcessor
  extends WorkerHost
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DynamicMessageProcessor.name);

  constructor(
    private readonly platformRegistry: PlatformRegistry,
    @InjectQueue('messages') private readonly messageQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly webhookDeliveryService: WebhookDeliveryService,
  ) {
    super(); // Required for WorkerHost
    this.logger.log('Queue processor initialized');
  }

  async onModuleInit() {
    this.logger.log('BullMQ processor ready for message processing');
  }

  // BullMQ WorkerHost requires this method name
  async process(job: Job<MessageJob>) {
    const { projectId, message } = job.data;

    // Parse target string into array
    const parsedTargets = this.parseTargetString(message.target);

    // Build content from text shortcut or content object
    const content = message.content || {};
    if (message.text && !content.text) {
      content.text = message.text;
    }

    // SECURITY: Deduplicate targets to prevent spam attacks
    const targetMap = new Map<string, ParsedTarget>();
    const duplicatesDetected: string[] = [];

    for (const target of parsedTargets) {
      const targetKey = this.generateSafeTargetKey(target);

      if (!targetMap.has(targetKey)) {
        targetMap.set(targetKey, target);
      } else {
        duplicatesDetected.push(targetKey);
        this.logger.warn(
          `🚨 DUPLICATE TARGET BLOCKED: ${this.sanitizeForLogging(targetKey)} (prevents spam)`,
        );
      }
    }

    const uniqueTargets = Array.from(targetMap.values());
    const originalCount = parsedTargets.length;
    const deduplicatedCount = uniqueTargets.length;

    if (duplicatesDetected.length > 0) {
      this.logger.warn(
        `🛡️ SPAM PROTECTION: Removed ${duplicatesDetected.length} duplicate targets from job ${job.id}`,
      );
    }

    this.logger.log(
      `Processing job ${job.id} - ${originalCount} targets (${deduplicatedCount} unique after deduplication)`,
    );

    const results: any[] = [];
    const errors: any[] = [];

    // Process each unique target with single database call per target
    for (const target of uniqueTargets) {
      let platformConfig: any = null;
      let sentMessageId: string | null = null; // Declare outside for error handling access

      try {
        // SECURITY: Validate platform ownership before accessing
        platformConfig = await this.prisma.projectPlatform.findFirst({
          where: {
            id: target.platformId,
            projectId: projectId, // CRITICAL: Ensure platform belongs to this project
          },
          select: {
            id: true,
            platform: true,
            isActive: true,
            credentialsEncrypted: true,
            webhookToken: true,
          },
        });

        if (!platformConfig) {
          throw new Error(
            `Platform configuration not found or access denied for ${target.platformId}`,
          );
        }

        if (!platformConfig.isActive) {
          throw new Error(
            `Platform configuration '${target.platformId}' is not active`,
          );
        }

        // Decrypt credentials securely
        const decryptedCredentials = JSON.parse(
          CryptoUtil.decrypt(platformConfig.credentialsEncrypted),
        );

        // Transform to expected format
        platformConfig = {
          ...platformConfig,
          decryptedCredentials,
        };

        this.logger.log(
          `Sending to ${platformConfig.platform}:${target.type}:${target.id} (platformId: ${target.platformId})`,
        );

        // Get the platform provider
        const provider = this.platformRegistry.getProvider(
          platformConfig.platform,
        );

        if (!provider) {
          throw new Error(
            `Platform provider '${platformConfig.platform}' not found`,
          );
        }

        // Upsert chat record (required for chatId)
        const chat = await this.prisma.chat.upsert({
          where: {
            projectId_platformId_providerChatId: {
              projectId,
              platformId: target.platformId,
              providerChatId: target.id,
            },
          },
          create: {
            projectId,
            platformId: target.platformId,
            providerChatId: target.id,
            chatType:
              target.type === 'user' ? ChatType.user : ChatType.channel,
          },
          update: {
            lastMessageAt: new Date(),
          },
        });

        // Create message record now that platform is validated (just before sending)
        const sentMessage = await this.prisma.message.create({
          data: {
            projectId,
            platformId: target.platformId,
            chatId: chat.id,
            direction: MessageDirection.sent,
            source: MessageSource.api,
            jobId: job.id?.toString(),
            providerChatId: target.id,
            providerUserId: target.type === 'user' ? target.id : 'system',
            messageText: content.text || null,
            messageContent: content,
            status: MessageStatus.queued,
          },
        });

        sentMessageId = sentMessage.id; // Store ID for safe, precise updates

        // Create composite key for this specific platform instance
        const connectionKey = `${projectId}:${target.platformId}`;

        // Get or create adapter for this project and platform instance
        let adapter = provider.getAdapter(connectionKey);

        if (!adapter) {
          // Create adapter through the provider with platform-specific credentials
          // Include webhookToken for platforms that need webhook registration
          const credentials = {
            ...platformConfig.decryptedCredentials,
            webhookToken: platformConfig.webhookToken,
          };
          adapter = await provider.createAdapter(connectionKey, credentials);
        }

        // Create message envelope
        const envelope = makeEnvelope({
          channel: platformConfig.platform,
          projectId,
          threadId: target.id,
          user: {
            providerUserId: 'system',
            display: 'System',
          },
          message: {
            text: content.text,
          },
          provider: {
            eventId: `job-${job.id}-${platformConfig.platform}-${target.id}`,
            raw: {
              platformId: target.platformId,
              ...message.metadata,
            },
          },
        });

        // Send the message through the adapter
        const result = await adapter.sendMessage(envelope, {
          subject: content.subject,
          text: content.text,
          markdown: content.markdown,
          html: content.html,
          attachments: content.attachments,
          buttons: content.buttons,
          embeds: content.embeds,
          platformOptions: content.platformOptions,
          threadId: target.id,
          replyTo: message.options?.replyTo,
          silent: message.options?.silent,
        });

        this.logger.log(
          `Message sent successfully to ${platformConfig.platform}:${target.type}:${target.id} (platformId: ${target.platformId}) - Provider Message ID: ${result.providerMessageId}`,
        );

        // Update message status to 'sent' (using specific ID for safety)
        try {
          const updatedMessage = await this.prisma.message.update({
            where: { id: sentMessageId },
            data: {
              status: MessageStatus.sent,
              providerMessageId: result.providerMessageId,
              timestamp: new Date(),
            },
          });

          // Deliver webhook event for successful message send
          await this.webhookDeliveryService.deliverEvent(
            projectId,
            WebhookEventType.MESSAGE_SENT,
            {
              message_id: updatedMessage.id,
              job_id: updatedMessage.jobId,
              platform: platformConfig.platform,
              platform_id: updatedMessage.platformId,
              target: {
                type: target.type,
                chat_id: updatedMessage.providerChatId,
                user_id: updatedMessage.providerUserId,
              },
              text: updatedMessage.messageText,
              source: 'api', // Messages sent via queue are always API-sourced
              sent_at: updatedMessage.timestamp.toISOString(),
            },
          );
        } catch (error) {
          this.logger.error(
            `Failed to update sent message status: ${error.message}`,
          );
        }

        results.push({
          success: true,
          target: {
            ...target,
            platform: platformConfig.platform,
          },
          providerMessageId: result.providerMessageId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // Robust permanent failure detection (error-type based, not string-based)
        const isPermanentFailure = this.classifyErrorAsPermanent(error);

        if (isPermanentFailure) {
          this.logger.error(
            `[PERMANENT FAILURE] Platform ${target.platformId} - ${error.message} - RECORDING FAILURE AND CONTINUING`,
          );

          // Record permanent failure but continue with other targets
          // Don't throw - this would terminate processing for other platforms
        }

        // Use platform type from main lookup (no duplicate database call needed)
        const platformType = platformConfig?.platform || 'unknown';

        const errorType = isPermanentFailure
          ? 'PERMANENT FAILURE'
          : 'TEMPORARY FAILURE - will retry';
        this.logger.error(
          `Failed to send message to ${platformType}:${target.type}:${target.id} (platformId: ${target.platformId}): ${error.message} - ${errorType}`,
        );

        // Update message status to 'failed' (using specific ID if available)
        try {
          if (sentMessageId) {
            const failedMessage = await this.prisma.message.update({
              where: { id: sentMessageId },
              data: {
                status: MessageStatus.failed,
                errorMessage: error.message,
              },
            });

            // Deliver webhook event for failed message send
            await this.webhookDeliveryService.deliverEvent(
              projectId,
              WebhookEventType.MESSAGE_FAILED,
              {
                job_id: failedMessage.jobId || job.id?.toString() || 'unknown',
                platform: platformConfig.platform,
                platform_id: failedMessage.platformId,
                target: {
                  type: target.type,
                  chat_id: failedMessage.providerChatId,
                },
                error: error.message,
                failed_at: new Date().toISOString(),
              },
            );
          } else {
            // Fallback to updateMany if message wasn't created (early failures)
            await this.prisma.message.updateMany({
              where: {
                jobId: job.id?.toString(),
                platformId: target.platformId,
                providerChatId: target.id,
              },
              data: {
                status: MessageStatus.failed,
                errorMessage: error.message,
              },
            });

            // Deliver webhook event for failed message (without full message data)
            await this.webhookDeliveryService.deliverEvent(
              projectId,
              WebhookEventType.MESSAGE_FAILED,
              {
                job_id: job.id?.toString() || 'unknown',
                platform: platformType,
                platform_id: target.platformId,
                target: {
                  type: target.type,
                  chat_id: target.id,
                },
                error: error.message,
                failed_at: new Date().toISOString(),
              },
            );
          }
        } catch (updateError) {
          this.logger.error(
            `Failed to update sent message failure status: ${updateError.message}`,
          );
        }

        errors.push({
          target: {
            ...target,
            platform: platformType,
          },
          error: error.message,
          permanent: isPermanentFailure,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Return results with deduplication information
    const totalTargets = originalCount; // Original target count
    const uniqueTargetCount = deduplicatedCount; // After deduplication
    const successCount = results.length;
    const failureCount = errors.length;
    const duplicatesRemoved = originalCount - deduplicatedCount;

    this.logger.log(
      `Job ${job.id} completed: ${successCount}/${uniqueTargetCount} unique targets successful, ${failureCount} failed, ${duplicatesRemoved} duplicates removed`,
    );

    return {
      success: failureCount === 0,
      totalTargets,
      uniqueTargets: uniqueTargetCount,
      successCount,
      failureCount,
      duplicatesRemoved,
      results,
      errors,
      timestamp: new Date().toISOString(),
    };
  }

  async onModuleDestroy() {
    this.logger.log(
      '🔌 DynamicMessageProcessor onModuleDestroy - shutting down processor',
    );
    this.logger.log(
      '🛑 Message processor shutting down, cleaning up platform providers...',
    );

    // Let the platform registry handle cleanup
    const providers = this.platformRegistry.getAllProviders();
    for (const provider of providers) {
      try {
        await provider.shutdown();
      } catch (error) {
        this.logger.warn(
          `Failed to shutdown provider ${provider.name}: ${error instanceof Error ? error.message : error}`,
        );
      }
    }

    this.logger.log('Message processor cleanup complete');
  }

  /**
   * Parse target string into array of ParsedTarget
   * Format: "platformId:type:id" or comma-separated "p1:user:1,p2:channel:2"
   */
  private parseTargetString(targetString: string): ParsedTarget[] {
    const targetParts = targetString.split(',').map(s => s.trim()).filter(s => s);

    return targetParts.map(part => {
      const segments = part.split(':');
      if (segments.length < 3) {
        throw new Error(
          `Invalid target format: "${part}". Expected "platformId:type:id"`,
        );
      }

      return {
        platformId: segments[0],
        type: segments[1].toLowerCase(),
        id: segments.slice(2).join(':'), // Handle IDs with colons
      };
    });
  }

  /**
   * Robust error classification to determine if failure is permanent (shouldn't retry)
   * Uses error types and structured patterns instead of fragile string matching
   */
  private classifyErrorAsPermanent(error: Error): boolean {
    const message = error.message.toLowerCase();
    const errorName = error.constructor.name.toLowerCase();

    // Error type-based classification (most reliable)
    if (errorName.includes('notfound') || errorName.includes('forbidden')) {
      return true;
    }

    // Structured error pattern matching (more reliable than simple includes)
    const permanentPatterns = [
      /platform.*not found/i,
      /configuration.*not found/i,
      /access.*denied/i,
      /platform.*disabled/i,
      /invalid.*platform/i,
      /credentials.*invalid/i,
      /token.*invalid/i,
      /platform.*inactive/i,
      /provider.*not found/i,
    ];

    return permanentPatterns.some((pattern) => pattern.test(message));
  }

  /**
   * Generate safe, collision-resistant target key that handles special characters
   * Uses JSON serialization instead of string concatenation to avoid delimiter conflicts
   */
  private generateSafeTargetKey(target: any): string {
    // Use JSON serialization for unambiguous key generation
    const normalized = {
      platformId: target.platformId?.trim(),
      type: target.type?.trim(),
      id: target.id?.trim(),
    };

    return JSON.stringify(normalized);
  }

  /**
   * Sanitize sensitive data for logging to prevent information disclosure
   * Masks platform IDs and target IDs while preserving structure for debugging
   */
  private sanitizeForLogging(data: string): string {
    // Parse the JSON key safely
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify({
        platformId: this.maskId(parsed.platformId),
        type: parsed.type, // Type is safe to log (user/channel/group)
        id: this.maskId(parsed.id),
      });
    } catch {
      // Fallback for non-JSON keys
      return data.replace(/[a-f0-9-]{8,}/gi, '***masked***');
    }
  }

  /**
   * Mask sensitive IDs for logging while preserving first/last chars for debugging
   */
  private maskId(id: string): string {
    if (!id || id.length <= 4) return '***';
    return `${id.substring(0, 2)}***${id.substring(id.length - 2)}`;
  }
}
