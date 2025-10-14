import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('MessagesService', () => {
  let service: MessagesService;
  let prisma: PrismaService;

  const mockAuthContext = {
    authType: 'api-key' as const,
    project: { id: 'project-id', slug: 'test-project' },
  };

  const mockPrismaService = {
    project: {
      findUnique: jest.fn(),
    },
    receivedMessage: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    receivedReaction: {
      findMany: jest.fn(),
    },
    sentMessage: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    identityAlias: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    mockPrismaService.identityAlias.findMany.mockResolvedValue([]);
  });

  describe('getMessages', () => {
    const mockProject = { id: 'project-id', slug: 'test-project' };

    // Factory function to get fresh message objects (prevents mutation between tests)
    const getMockMessages = () => [
      {
        id: 'msg-1',
        projectId: 'project-id',
        platformId: 'platform-1',
        platform: 'discord',
        providerMessageId: 'discord-msg-1',
        providerChatId: 'channel-123',
        providerUserId: 'user-456',
        userDisplay: 'TestUser',
        messageText: 'Hello from Discord',
        messageType: 'text',
        rawData: { discord: 'data' },
        receivedAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        id: 'msg-2',
        projectId: 'project-id',
        platformId: 'platform-2',
        platform: 'telegram',
        providerMessageId: 'telegram-msg-1',
        providerChatId: 'chat-789',
        providerUserId: 'user-123',
        userDisplay: 'TelegramUser',
        messageText: 'Hello from Telegram',
        messageType: 'text',
        rawData: { telegram: 'data' },
        receivedAt: new Date('2024-01-01T11:00:00Z'),
      },
    ];

    beforeEach(() => {
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      // Mock identity resolution to return null (no identity linked)
      mockPrismaService.identityAlias.findUnique.mockResolvedValue(null);
      // Mock sent messages to return empty by default
      mockPrismaService.sentMessage.findMany.mockResolvedValue([]);
      mockPrismaService.sentMessage.count.mockResolvedValue(0);
    });

    it('should return all messages when no filters applied', async () => {
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        getMockMessages(),
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);

      const result = await service.getMessages(
        'test-project',
        { limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      expect(result.messages).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      // Verify it queries both received and sent messages
      expect(mockPrismaService.receivedMessage.findMany).toHaveBeenCalled();
      expect(mockPrismaService.sentMessage.findMany).toHaveBeenCalled();
      // Messages should have direction field
      expect(result.messages[0]).toHaveProperty('direction');
    });

    it('should filter messages by platformId', async () => {
      const filteredMessages = [getMockMessages()[0]]; // Only Discord message
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        filteredMessages,
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(1);

      const result = await service.getMessages(
        'test-project',
        { platformId: 'platform-1', limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      expect(result.messages).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.messages[0].platform).toBe('discord');
      // Verify platformId filter was applied to both queries
      expect(mockPrismaService.receivedMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ platformId: 'platform-1' }),
        }),
      );
      expect(mockPrismaService.sentMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ platformId: 'platform-1' }),
        }),
      );
    });

    it('should include raw data when raw=true', async () => {
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        getMockMessages(),
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);

      const result = await service.getMessages(
        'test-project',
        { raw: true, limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      expect(result.messages).toHaveLength(2);
      // Verify rawData was requested in select
      expect(mockPrismaService.receivedMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({ rawData: true }),
        }),
      );
    });

    it('should filter by chatId', async () => {
      const filteredMessages = [getMockMessages()[0]];
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        filteredMessages,
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(1);

      const result = await service.getMessages(
        'test-project',
        { chatId: 'channel-123', limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      expect(result.messages).toHaveLength(1);
      // Verify chat filter was applied to received messages
      expect(mockPrismaService.receivedMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ providerChatId: 'channel-123' }),
        }),
      );
      // And to sent messages (with different field name)
      expect(mockPrismaService.sentMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ targetChatId: 'channel-123' }),
        }),
      );
    });

    it('should filter by userId', async () => {
      const filteredMessages = [getMockMessages()[0]];
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        filteredMessages,
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(1);

      const result = await service.getMessages(
        'test-project',
        { userId: 'user-456', limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      expect(result.messages).toHaveLength(1);
      // Verify user filter applied
      expect(mockPrismaService.receivedMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ providerUserId: 'user-456' }),
        }),
      );
    });

    it('should filter by date range', async () => {
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        getMockMessages(),
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);

      const result = await service.getMessages(
        'test-project',
        {
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-01T23:59:59Z',
          limit: 50,
          offset: 0,
          order: 'desc',
        },
        mockAuthContext,
      );

      expect(result.messages).toHaveLength(2);
      // Verify date filter applied
      expect(mockPrismaService.receivedMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            receivedAt: expect.objectContaining({
              gte: new Date('2024-01-01T00:00:00Z'),
              lte: new Date('2024-01-01T23:59:59Z'),
            }),
          }),
        }),
      );
    });

    it('should combine multiple filters', async () => {
      const filteredMessages = [getMockMessages()[0]];
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        filteredMessages,
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(1);

      const result = await service.getMessages(
        'test-project',
        {
          platformId: 'platform-1',
          chatId: 'channel-123',
          raw: true,
          limit: 20,
          offset: 0, // Changed from 10 to 0 since we only have 1 message
          order: 'desc',
        },
        mockAuthContext,
      );

      expect(result.messages).toHaveLength(1);
      // Verify filters applied
      expect(mockPrismaService.receivedMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            platformId: 'platform-1',
            providerChatId: 'channel-123',
          }),
          select: expect.objectContaining({ rawData: true }),
        }),
      );
    });

    it('should use ascending order when specified', async () => {
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        getMockMessages(),
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);

      const result = await service.getMessages(
        'test-project',
        { order: 'asc', limit: 50, offset: 0 },
        mockAuthContext,
      );

      expect(result.messages).toHaveLength(2);
      // Verify order applied
      expect(mockPrismaService.receivedMessage.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { receivedAt: 'asc' },
        }),
      );
    });

    it('should throw NotFoundException when project does not exist', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(
        service.getMessages(
          'non-existent',
          { limit: 50, offset: 0, order: 'desc' },
          mockAuthContext,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should include reactions when reactions=true', async () => {
      const mockReactions = [
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-789',
          userDisplay: 'Alice',
          emoji: '👍',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-456',
          userDisplay: 'Bob',
          emoji: '👍',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:01:00Z'),
        },
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-321',
          userDisplay: 'Charlie',
          emoji: '❤️',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:02:00Z'),
        },
        {
          platformId: 'platform-2',
          providerMessageId: 'telegram-msg-1',
          providerUserId: 'user-111',
          userDisplay: null,
          emoji: '🔥',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:03:00Z'),
        },
      ];

      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        getMockMessages(),
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);
      mockPrismaService.receivedReaction.findMany.mockResolvedValue(
        mockReactions,
      );

      const result = await service.getMessages(
        'test-project',
        { reactions: true, limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      // Verify reactions query was called
      expect(mockPrismaService.receivedReaction.findMany).toHaveBeenCalled();

      // Find the discord message (order might vary after merge)
      const discordMsg = result.messages.find(m => m.providerMessageId === 'discord-msg-1');
      const telegramMsg = result.messages.find(m => m.providerMessageId === 'telegram-msg-1');

      // Verify reactions are attached correctly
      expect(discordMsg.reactions).toEqual({
        '👍': [
          { id: 'user-789', name: 'Alice', identity: null },
          { id: 'user-456', name: 'Bob', identity: null },
        ],
        '❤️': [{ id: 'user-321', name: 'Charlie', identity: null }],
      });

      expect(telegramMsg.reactions).toEqual({
        '🔥': [{ id: 'user-111', name: 'user-111', identity: null }],
      });
    });

    it('should not fetch reactions when reactions=false', async () => {
      // Fresh messages without reactions property
      const messagesWithoutReactions = getMockMessages().map((msg) => ({
        ...msg,
      }));

      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        messagesWithoutReactions,
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);

      const result = await service.getMessages(
        'test-project',
        { reactions: false, limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      expect(
        mockPrismaService.receivedReaction.findMany,
      ).not.toHaveBeenCalled();
      expect(result.messages[0].reactions).toBeUndefined();
      expect(result.messages[1].reactions).toBeUndefined();
    });

    it('should return empty reactions object when no reactions exist', async () => {
      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        getMockMessages(),
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);
      mockPrismaService.receivedReaction.findMany.mockResolvedValue([]);

      const result = await service.getMessages(
        'test-project',
        { reactions: true, limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      expect(result.messages[0].reactions).toEqual({});
      expect(result.messages[1].reactions).toEqual({});
    });

    it('should exclude reactions where latest event is removed', async () => {
      const mockReactions = [
        // User added 👍 then removed it (latest is removed)
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-789',
          userDisplay: 'Alice',
          emoji: '👍',
          reactionType: 'removed',
          receivedAt: new Date('2024-01-01T10:05:00Z'),
        },
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-789',
          userDisplay: 'Alice',
          emoji: '👍',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:00:00Z'),
        },
        // User added ❤️ and kept it (latest is added)
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-456',
          userDisplay: 'Bob',
          emoji: '❤️',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        getMockMessages(),
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);
      mockPrismaService.receivedReaction.findMany.mockResolvedValue(
        mockReactions,
      );

      const result = await service.getMessages(
        'test-project',
        { reactions: true, limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      // Find the discord message
      const discordMsg = result.messages.find(m => m.providerMessageId === 'discord-msg-1');

      // Should only show ❤️ (not 👍, since it was removed)
      expect(discordMsg.reactions).toEqual({
        '❤️': [{ id: 'user-456', name: 'Bob', identity: null }],
      });
    });

    it('should include reactions that were removed then re-added', async () => {
      const mockReactions = [
        // Latest: added (should show)
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-789',
          userDisplay: 'Alice',
          emoji: '👍',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:10:00Z'),
        },
        // Middle: removed
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-789',
          userDisplay: 'Alice',
          emoji: '👍',
          reactionType: 'removed',
          receivedAt: new Date('2024-01-01T10:05:00Z'),
        },
        // Oldest: added
        {
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
          providerUserId: 'user-789',
          userDisplay: 'Alice',
          emoji: '👍',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      mockPrismaService.receivedMessage.findMany.mockResolvedValue(
        getMockMessages(),
      );
      mockPrismaService.receivedMessage.count.mockResolvedValue(2);
      mockPrismaService.receivedReaction.findMany.mockResolvedValue(
        mockReactions,
      );

      const result = await service.getMessages(
        'test-project',
        { reactions: true, limit: 50, offset: 0, order: 'desc' },
        mockAuthContext,
      );

      // Find the discord message
      const discordMsg = result.messages.find(m => m.providerMessageId === 'discord-msg-1');

      // Should show 👍 because latest event is 'added'
      expect(discordMsg.reactions).toEqual({
        '👍': [{ id: 'user-789', name: 'Alice', identity: null }],
      });
    });
  });

  describe('getMessage', () => {
    it('should return single message by ID with reactions', async () => {
      const mockProject = { id: 'project-id' };
      const mockMessage = {
        id: 'msg-1',
        projectId: 'project-id',
        platformId: 'platform-1',
        platform: 'discord',
        providerMessageId: 'discord-msg-1',
        messageText: 'Hello',
        rawData: { discord: 'data' },
      };

      const mockReactions = [
        {
          platformId: 'platform-1',
          providerUserId: 'user-789',
          userDisplay: 'Alice',
          emoji: '👍',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          platformId: 'platform-1',
          providerUserId: 'user-456',
          userDisplay: 'Bob',
          emoji: '👍',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:01:00Z'),
        },
        {
          platformId: 'platform-1',
          providerUserId: 'user-321',
          userDisplay: null,
          emoji: '❤️',
          reactionType: 'added',
          receivedAt: new Date('2024-01-01T10:02:00Z'),
        },
      ];

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.receivedMessage.findUnique.mockResolvedValue(
        mockMessage,
      );
      mockPrismaService.receivedReaction.findMany.mockResolvedValue(
        mockReactions,
      );

      const result = await service.getMessage('test-project', 'msg-1');

      expect(mockPrismaService.receivedMessage.findUnique).toHaveBeenCalledWith(
        {
          where: {
            id: 'msg-1',
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
        },
      );

      expect(mockPrismaService.receivedReaction.findMany).toHaveBeenCalledWith({
        where: {
          projectId: 'project-id',
          platformId: 'platform-1',
          providerMessageId: 'discord-msg-1',
        },
        select: {
          platformId: true,
          providerUserId: true,
          userDisplay: true,
          emoji: true,
          reactionType: true,
          receivedAt: true,
        },
        orderBy: { receivedAt: 'desc' },
      });

      expect(result.reactions).toEqual({
        '👍': [
          { id: 'user-789', name: 'Alice', identity: null },
          { id: 'user-456', name: 'Bob', identity: null },
        ],
        '❤️': [{ id: 'user-321', name: 'user-321', identity: null }], // Falls back to ID
      });
    });

    it('should return message with empty reactions when no reactions exist', async () => {
      const mockProject = { id: 'project-id' };
      const mockMessage = {
        id: 'msg-1',
        projectId: 'project-id',
        platformId: 'platform-1',
        platform: 'discord',
        providerMessageId: 'discord-msg-1',
        messageText: 'Hello',
      };

      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.receivedMessage.findUnique.mockResolvedValue(
        mockMessage,
      );
      mockPrismaService.receivedReaction.findMany.mockResolvedValue([]);

      const result = await service.getMessage('test-project', 'msg-1');

      expect(result.reactions).toEqual({});
    });

    it('should throw NotFoundException when message not found', async () => {
      const mockProject = { id: 'project-id' };
      mockPrismaService.project.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.receivedMessage.findUnique.mockResolvedValue(null);

      await expect(
        service.getMessage('test-project', 'non-existent-msg'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
