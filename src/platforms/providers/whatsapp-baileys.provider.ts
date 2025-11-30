import {
  Injectable,
  Logger,
  Inject,
  OnModuleInit,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import makeWASocket, {
  WASocket,
  DisconnectReason,
  WAMessage,
  AnyMessageContent,
  proto,
  downloadMediaMessage,
  isJidGroup,
  Browsers,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import {
  PlatformProvider,
  PlatformLifecycleEvent,
} from '../interfaces/platform-provider.interface';
import { PlatformAdapter } from '../interfaces/platform-adapter.interface';
import type { IEventBus } from '../interfaces/event-bus.interface';
import { EVENT_BUS } from '../interfaces/event-bus.interface';
import { PlatformProviderDecorator } from '../decorators/platform-provider.decorator';
import { MessageEnvelopeV1 } from '../interfaces/message-envelope.interface';
import { makeEnvelope } from '../utils/envelope.factory';
import { PrismaService } from '../../prisma/prisma.service';
import { PlatformCapability } from '../enums/platform-capability.enum';
import { PlatformType } from '../../common/enums/platform-type.enum';
import { BaileysConnection } from './baileys-connection.interface';
import { BaileysCredentials } from './baileys-credentials.interface';
import { BaileysAuthStateService } from './baileys-auth-state.service';
import { WebhookDeliveryService } from '../../webhooks/services/webhook-delivery.service';
import { WebhookEventType } from '../../webhooks/types/webhook-event.types';
import { MessagesService } from '../messages/messages.service';
import { TranscriptionService } from '../../voice/services/transcription.service';
import { ProviderUtil } from './provider.util';
import { ChatType } from '@prisma/client';
import { AttachmentUtil } from '../../common/utils/attachment.util';

@Injectable()
@PlatformProviderDecorator(PlatformType.WHATSAPP_BAILEYS, [
  { capability: PlatformCapability.SEND_MESSAGE },
  { capability: PlatformCapability.RECEIVE_MESSAGE },
  {
    capability: PlatformCapability.ATTACHMENTS,
    limitations: '100MB max per file',
  },
  { capability: PlatformCapability.REACTIONS },
  {
    capability: PlatformCapability.VOICE_RECEIVE,
    limitations: 'Automatically transcribes voice messages',
  },
])
export class WhatsAppBaileysProvider
  implements PlatformProvider, PlatformAdapter, OnModuleInit
{
  private readonly logger = new Logger(WhatsAppBaileysProvider.name);
  private readonly connections = new Map<string, BaileysConnection>();
  private readonly MAX_CONNECTIONS = 100;

  readonly name = PlatformType.WHATSAPP_BAILEYS;
  readonly displayName = 'WhatsApp (Baileys)';
  readonly connectionType = 'websocket' as const;
  readonly channel = PlatformType.WHATSAPP_BAILEYS;

  constructor(
    @Inject(EVENT_BUS) private readonly eventBus: IEventBus,
    private readonly prisma: PrismaService,
    private readonly authStateService: BaileysAuthStateService,
    private readonly webhookDeliveryService: WebhookDeliveryService,
    private readonly messagesService: MessagesService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log(
      'Baileys WhatsApp provider initialized - checking for active platforms...',
    );

    try {
      // Query for all active Baileys platforms
      const activePlatforms = await this.prisma.projectPlatform.findMany({
        where: {
          platform: PlatformType.WHATSAPP_BAILEYS,
          isActive: true,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `Found ${activePlatforms.length} active Baileys WhatsApp platforms to initialize`,
      );

      // Connect all active platforms
      const connectionPromises = activePlatforms.map(async (platform) => {
        const connectionKey = `${platform.projectId}:${platform.id}`;

        try {
          const credentials =
            ProviderUtil.decryptPlatformCredentials<BaileysCredentials>(
              platform.credentialsEncrypted,
            );

          await this.createAdapter(connectionKey, credentials);
          this.logger.log(
            `Baileys WhatsApp auto-connected for project ${platform.project.name} (${connectionKey})`,
          );
        } catch (error) {
          this.logger.error(
            `Failed to auto-connect Baileys for ${connectionKey}: ${error.message}`,
          );
        }
      });

      await Promise.allSettled(connectionPromises);
    } catch (error) {
      this.logger.error('Error initializing Baileys platforms:', error);
    }
  }

  async initialize(): Promise<void> {
    this.logger.log('Baileys WhatsApp provider ready');
  }

  async shutdown(): Promise<void> {
    this.logger.log('Shutting down all Baileys WhatsApp connections...');

    const disconnectPromises = Array.from(this.connections.keys()).map(
      (connectionKey) => this.removeAdapter(connectionKey),
    );

    await Promise.allSettled(disconnectPromises);
    this.logger.log('All Baileys connections shut down');
  }

  async createAdapter(
    connectionKey: string,
    credentials: BaileysCredentials,
  ): Promise<PlatformAdapter> {
    if (this.connections.size >= this.MAX_CONNECTIONS) {
      throw new BadRequestException(
        `Maximum connections (${this.MAX_CONNECTIONS}) reached`,
      );
    }

    // Check if already connected
    if (this.connections.has(connectionKey)) {
      this.logger.warn(`Connection ${connectionKey} already exists`);
      return this;
    }

    const [projectId, platformId] = connectionKey.split(':');

    try {
      // Load auth state from database
      const { state, saveCreds } =
        await this.authStateService.loadAuthState(connectionKey);

      // Create Baileys socket
      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: Browsers.ubuntu(
          credentials.browserName || 'MsgCore',
        ) as any,
        getMessage: async (key) => {
          // Required for message history
          return {
            conversation: 'Message not found',
          };
        },
      });

      // Create connection object
      const connection: BaileysConnection = {
        connectionKey,
        projectId,
        platformId,
        sock,
        isConnected: false,
        connectionState: 'connecting',
        lastActivity: new Date(),
        reconnectAttempts: 0,
      };

      // Set up event handlers
      this.setupEventHandlers(connection, saveCreds);

      // Store connection
      this.connections.set(connectionKey, connection);

      this.logger.log(`Baileys connection created for ${connectionKey}`);
      return this;
    } catch (error) {
      this.logger.error(
        `Failed to create Baileys connection for ${connectionKey}:`,
        error,
      );
      throw error;
    }
  }

  getAdapter(connectionKey: string): PlatformAdapter | undefined {
    const connection = this.connections.get(connectionKey);
    return connection ? this : undefined;
  }

  async removeAdapter(connectionKey: string): Promise<void> {
    const connection = this.connections.get(connectionKey);
    if (!connection) {
      return;
    }

    this.logger.log(`Removing Baileys connection ${connectionKey}...`);

    try {
      // Clean up event listeners
      if (connection.eventCleanup) {
        connection.eventCleanup();
      }

      // Close socket
      connection.sock?.end(undefined);

      // Remove from map
      this.connections.delete(connectionKey);

      this.logger.log(`Baileys connection ${connectionKey} removed`);
    } catch (error) {
      this.logger.error(
        `Error removing Baileys connection ${connectionKey}:`,
        error,
      );
    }
  }

  private setupEventHandlers(
    connection: BaileysConnection,
    saveCreds: () => Promise<void>,
  ): void {
    const { sock, projectId, platformId, connectionKey } = connection;

    // ===== CONNECTION UPDATE =====
    const onConnectionUpdate = async (update: any) => {
      const { connection: connState, lastDisconnect, qr } = update;

      // QR code for pairing
      if (qr) {
        connection.qrCode = qr;
        this.logger.log(`QR code generated for ${connectionKey}`);
      }

      // Connection state changes
      if (connState === 'close') {
        connection.isConnected = false;
        connection.connectionState = 'close';
        connection.qrCode = undefined;

        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        if (shouldReconnect && connection.reconnectAttempts < 5) {
          connection.reconnectAttempts++;
          this.logger.warn(
            `Reconnecting ${connectionKey} (attempt ${connection.reconnectAttempts})`,
          );

          setTimeout(async () => {
            try {
              const { platformId } = await ProviderUtil.getPlatformCredentials<BaileysCredentials>(
                connectionKey,
                this.prisma,
                PlatformType.WHATSAPP_BAILEYS,
              );
              const platform = await this.prisma.projectPlatform.findUnique({
                where: { id: platformId },
              });
              if (platform) {
                const credentials =
                  ProviderUtil.decryptPlatformCredentials<BaileysCredentials>(
                    platform.credentialsEncrypted,
                  );
                await this.removeAdapter(connectionKey);
                await this.createAdapter(connectionKey, credentials);
              }
            } catch (error) {
              this.logger.error(`Reconnection failed for ${connectionKey}:`, error);
            }
          }, 5000);
        } else {
          this.logger.error(
            `Connection permanently closed for ${connectionKey}`,
          );
          await this.removeAdapter(connectionKey);
        }
      } else if (connState === 'open') {
        connection.isConnected = true;
        connection.connectionState = 'open';
        connection.reconnectAttempts = 0;
        connection.qrCode = undefined;
        this.logger.log(`✅ WhatsApp connected for ${connectionKey}`);
      } else if (connState === 'connecting') {
        connection.connectionState = 'connecting';
        this.logger.log(`Connecting WhatsApp for ${connectionKey}...`);
      }
    };

    // ===== CREDENTIALS UPDATE =====
    const onCredsUpdate = async () => {
      await saveCreds();
    };

    // ===== MESSAGES RECEIVED =====
    const onMessagesUpsert = async (m: any) => {
      const messages: WAMessage[] = m.messages;

      for (const msg of messages) {
        // Skip protocol messages (receipts, etc.) - they don't have message content
        if (!msg.message) {
          this.logger.debug(
            `Skipping protocol message (no content): ${msg.key.id}`,
          );
          continue;
        }

        try {
          const chatId = msg.key.remoteJid || '';
          const chatType = isJidGroup(chatId) ? ChatType.group : ChatType.user;
          const userId = msg.key.participant || chatId;
          const messageText = this.extractMessageText(msg);
          const normalizedAttachments = await this.normalizeAttachments(msg);

          // Skip messages with no text AND no attachments (empty messages)
          if (!messageText && (!normalizedAttachments || normalizedAttachments.length === 0)) {
            this.logger.debug(
              `Skipping empty message (no text or attachments): ${msg.key.id}`,
            );
            continue;
          }

          // Store in database
          await this.messagesService.storeIncomingMessage({
            projectId,
            platformId,
            platform: PlatformType.WHATSAPP_BAILEYS,
            providerMessageId: msg.key.id || '',
            providerChatId: chatId,
            providerUserId: userId,
            userDisplay: msg.pushName || 'WhatsApp User',
            messageText,
            messageType: 'text',
            fromMe: msg.key.fromMe || false,
            attachments: normalizedAttachments,
            rawData: this.serializeRawData({ ...msg, platformId }),
          });

          // Create envelope and publish to event bus
          const envelope = this.toEnvelope({ ...msg, platformId }, projectId);
          await this.eventBus.publish(envelope);

          // Fire webhook notification
          await this.webhookDeliveryService.deliverEvent(
            projectId,
            WebhookEventType.MESSAGE_RECEIVED,
            {
              message_id: msg.key.id || '',
              platform: PlatformType.WHATSAPP_BAILEYS,
              platform_id: platformId,
              chat_id: chatId,
              user_id: userId,
              user_display: msg.pushName || 'WhatsApp User',
              text: messageText,
              message_type: 'text',
              received_at: new Date().toISOString(),
            },
          );

          connection.lastActivity = new Date();
        } catch (error) {
          this.logger.error(
            `Error processing message for ${connectionKey}:`,
            error,
          );
        }
      }
    };

    // ===== MESSAGE REACTIONS =====
    const onMessagesReaction = async (reactions: any[]) => {
      for (const { key, reaction } of reactions) {
        this.logger.log(
          `Reaction received: ${reaction.text} on message ${key.id}`,
        );
        // TODO: Store reactions in database if needed
      }
    };

    // Register event listeners
    sock.ev.on('connection.update', onConnectionUpdate);
    sock.ev.on('creds.update', onCredsUpdate);
    sock.ev.on('messages.upsert', onMessagesUpsert);
    sock.ev.on('messages.reaction', onMessagesReaction);

    // Store cleanup function
    connection.eventCleanup = () => {
      sock.ev.off('connection.update', onConnectionUpdate);
      sock.ev.off('creds.update', onCredsUpdate);
      sock.ev.off('messages.upsert', onMessagesUpsert);
      sock.ev.off('messages.reaction', onMessagesReaction);
    };
  }

  async sendMessage(
    env: MessageEnvelopeV1,
    reply: {
      subject?: string;
      text?: string;
      markdown?: string;
      html?: string;
      attachments?: Array<{
        url: string;
        mime?: string;
        caption?: string;
        name?: string;
      }>;
      buttons?: any[];
      embeds?: any[];
      platformOptions?: Record<string, any>;
      threadId?: string;
      replyTo?: string;
      silent?: boolean;
    },
  ): Promise<{ providerMessageId: string }> {
    // Extract platformId from envelope
    const platformId = (env.provider?.raw as any)?.platformId;
    if (!platformId) {
      throw new BadRequestException('platformId is required in envelope');
    }

    const connectionKey = `${env.projectId}:${platformId}`;
    const connection = this.connections.get(connectionKey);

    if (!connection || !connection.isConnected) {
      throw new BadRequestException(
        `WhatsApp not connected for ${connectionKey}`,
      );
    }

    const chatId = reply.threadId ?? env.threadId;
    if (!chatId) {
      throw new BadRequestException('threadId is required');
    }

    try {
      let messageContent: AnyMessageContent;

      // Handle attachments
      if (reply.attachments && reply.attachments.length > 0) {
        const attachment = reply.attachments[0];
        const mime = attachment.mime || 'application/octet-stream';

        if (mime.startsWith('image/')) {
          messageContent = {
            image: { url: attachment.url },
            caption: reply.text || attachment.caption,
          };
        } else if (mime.startsWith('video/')) {
          messageContent = {
            video: { url: attachment.url },
            caption: reply.text || attachment.caption,
          };
        } else if (mime.startsWith('audio/')) {
          messageContent = {
            audio: { url: attachment.url },
            mimetype: mime,
          };
        } else {
          messageContent = {
            document: { url: attachment.url },
            mimetype: mime,
            fileName: attachment.name || 'file',
            caption: reply.text,
          };
        }
      } else {
        // Text-only message
        messageContent = {
          text: reply.text || reply.markdown || 'Message',
        };
      }

      // Add quoted message if replying
      if (reply.replyTo) {
        (messageContent as any).quoted = {
          key: { id: reply.replyTo, remoteJid: chatId },
        };
      }

      // Send message
      const result = await connection.sock.sendMessage(chatId, messageContent);

      connection.lastActivity = new Date();

      return { providerMessageId: result?.key.id || '' };
    } catch (error) {
      this.logger.error(
        `Error sending message for ${connectionKey}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to send WhatsApp message');
    }
  }

  toEnvelope(providerPayload: any, projectId?: string): MessageEnvelopeV1 {
    const msg = providerPayload as WAMessage & { platformId?: string };

    return makeEnvelope({
      channel: PlatformType.WHATSAPP_BAILEYS,
      projectId: projectId || '',
      threadId: msg.key.remoteJid || undefined,
      user: {
        providerUserId: msg.key.participant || msg.key.remoteJid || '',
        display: msg.pushName || 'WhatsApp User',
      },
      message: {
        text: this.extractMessageText(msg),
        attachments: [],
      },
      provider: {
        eventId: msg.key.id || undefined,
        raw: providerPayload,
      },
    });
  }

  async onPlatformEvent(event: PlatformLifecycleEvent): Promise<void> {
    const connectionKey = `${event.projectId}:${event.platformId}`;

    if (event.type === 'created' || event.type === 'activated') {
      await this.createAdapter(connectionKey, event.credentials);
    } else if (event.type === 'updated') {
      await this.removeAdapter(connectionKey);
      await this.createAdapter(connectionKey, event.credentials);
    } else if (event.type === 'deactivated' || event.type === 'deleted') {
      await this.removeAdapter(connectionKey);

      // Delete auth state on platform deletion
      if (event.type === 'deleted') {
        await this.authStateService.deleteAuthState(connectionKey);
      }
    }
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  getWebhookConfig(): any {
    return null; // Baileys doesn't use webhooks
  }

  async start(): Promise<void> {
    // No-op for Baileys (WebSocket-based)
  }

  async stop(): Promise<void> {
    await this.shutdown();
  }

  /**
   * Get QR code for a specific connection
   */
  async getQRCode(connectionKey: string): Promise<string | null> {
    const connection = this.connections.get(connectionKey);
    return connection?.qrCode || null;
  }

  private extractMessageText(msg: WAMessage): string {
    const messageContent = msg.message;
    if (!messageContent) return '';

    // Text messages
    if (messageContent.conversation) return messageContent.conversation;
    if (messageContent.extendedTextMessage?.text)
      return messageContent.extendedTextMessage.text;

    // Media with captions
    if (messageContent.imageMessage?.caption)
      return messageContent.imageMessage.caption;
    if (messageContent.videoMessage?.caption)
      return messageContent.videoMessage.caption;
    if (messageContent.documentMessage?.caption)
      return messageContent.documentMessage.caption;

    // Buttons
    if (messageContent.buttonsResponseMessage?.selectedButtonId) {
      return messageContent.buttonsResponseMessage.selectedButtonId;
    }

    return '';
  }

  /**
   * Serialize raw message data for database storage.
   * Converts non-JSON-serializable types (Uint8Array, Long objects) to plain values.
   */
  private serializeRawData(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;

    // Handle Uint8Array - convert to base64 string
    if (obj instanceof Uint8Array) {
      return Buffer.from(obj).toString('base64');
    }

    // Handle Long/protobuf number objects with low/high
    if (
      typeof obj === 'object' &&
      obj !== null &&
      'low' in obj &&
      'high' in obj &&
      typeof (obj as { low: number }).low === 'number'
    ) {
      const longObj = obj as { low: number; high: number; unsigned?: boolean };
      // Convert to number (safe for values < 2^53)
      if (longObj.high === 0) {
        return longObj.unsigned ? longObj.low >>> 0 : longObj.low;
      }
      // For larger values, convert to string to preserve precision
      const value = BigInt(longObj.high) * BigInt(0x100000000) + BigInt(longObj.low >>> 0);
      return value.toString();
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map((item) => this.serializeRawData(item));
    }

    // Handle plain objects
    if (typeof obj === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.serializeRawData(value);
      }
      return result;
    }

    return obj;
  }

  /**
   * Normalize Baileys message attachments to MsgCore format
   *
   * NOTE: Currently stores attachment metadata only.
   * Media download/upload will be implemented in future enhancement.
   */
  private normalizeAttachments(msg: WAMessage): any[] | undefined {
    const messageContent = msg.message;
    if (!messageContent) return undefined;

    const attachments: Array<{
      type: string;
      mimeType: string;
      url?: string;
      filename?: string;
    }> = [];

    try {
      // Image
      if (messageContent.imageMessage) {
        attachments.push({
          type: 'image',
          mimeType: messageContent.imageMessage.mimetype || 'image/jpeg',
          url: messageContent.imageMessage.url || undefined,
        });
      }

      // Video
      if (messageContent.videoMessage) {
        attachments.push({
          type: 'video',
          mimeType: messageContent.videoMessage.mimetype || 'video/mp4',
          url: messageContent.videoMessage.url || undefined,
        });
      }

      // Audio/Voice
      if (messageContent.audioMessage) {
        const isVoice = messageContent.audioMessage.ptt;
        attachments.push({
          type: isVoice ? 'voice' : 'audio',
          mimeType: messageContent.audioMessage.mimetype || 'audio/ogg',
          url: messageContent.audioMessage.url || undefined,
        });
      }

      // Document
      if (messageContent.documentMessage) {
        attachments.push({
          type: 'document',
          mimeType:
            messageContent.documentMessage.mimetype ||
            'application/octet-stream',
          url: messageContent.documentMessage.url || undefined,
          filename: messageContent.documentMessage.fileName || undefined,
        });
      }
    } catch (error) {
      this.logger.error('Error normalizing attachments:', error);
    }

    return attachments.length > 0 ? attachments : undefined;
  }
}
