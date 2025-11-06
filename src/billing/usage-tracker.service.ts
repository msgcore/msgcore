import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TierLimitsService } from './tier-limits.service';
import Redis from 'ioredis';

export interface UsageStats {
  messagesThisMonth: number;
  messageLimit: number;
  messageUsagePercent: number;
}

@Injectable()
export class UsageTrackerService {
  private readonly logger = new Logger(UsageTrackerService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly prisma: PrismaService,
    private readonly tierLimitsService: TierLimitsService,
  ) {}

  /**
   * Increment message count for a user
   */
  async incrementMessageCount(userId: string): Promise<void> {
    const month = this.getCurrentMonthKey();
    const key = `usage:${userId}:${month}:messages`;

    try {
      await this.redis.incr(key);

      // Set expiration on first increment (TTL: 60 days to keep 2 months of data)
      const ttl = await this.redis.ttl(key);
      if (ttl === -1) {
        await this.redis.expire(key, 60 * 24 * 60 * 60); // 60 days in seconds
      }
    } catch (error) {
      // Non-critical: Log error but don't block message sending
      this.logger.error(`Failed to increment message count for user ${userId}: ${error.message}`);
    }
  }

  /**
   * Get current message count for a user
   */
  async getMessageCount(userId: string, month?: string): Promise<number> {
    const monthKey = month || this.getCurrentMonthKey();
    const key = `usage:${userId}:${monthKey}:messages`;

    try {
      const count = await this.redis.get(key);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      this.logger.error(`Failed to get message count for user ${userId}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get usage statistics for a user
   */
  async getUsageStats(userId: string): Promise<UsageStats> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return {
        messagesThisMonth: 0,
        messageLimit: 0,
        messageUsagePercent: 0,
      };
    }

    const limits = this.tierLimitsService.getLimits(user.subscriptionTier);
    const messagesThisMonth = await this.getMessageCount(userId);

    const messageLimit = limits.messagesPerMonth === -1 ? -1 : limits.messagesPerMonth;
    const messageUsagePercent =
      messageLimit === -1 ? 0 : Math.round((messagesThisMonth / messageLimit) * 100);

    return {
      messagesThisMonth,
      messageLimit,
      messageUsagePercent,
    };
  }

  /**
   * Check if user has exceeded their message limit
   * Throws PaymentRequiredException if limit exceeded
   */
  async checkMessageLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const limits = this.tierLimitsService.getLimits(user.subscriptionTier);

    // -1 means unlimited
    if (limits.messagesPerMonth === -1) {
      return;
    }

    const currentCount = await this.getMessageCount(userId);

    if (currentCount >= limits.messagesPerMonth) {
      const { PaymentRequiredException } = require('./tier-limits.service');

      throw new PaymentRequiredException({
        message: `Your ${user.subscriptionTier} plan is limited to ${limits.messagesPerMonth} messages per month`,
        currentTier: user.subscriptionTier,
        currentLimit: limits.messagesPerMonth,
        currentUsage: currentCount,
        upgradeUrl: '/billing/upgrade',
        nextTier: this.tierLimitsService['getNextTier'](user.subscriptionTier),
      });
    }
  }

  /**
   * Reset usage counters (for testing/admin purposes)
   */
  async resetUsageForUser(userId: string, month?: string): Promise<void> {
    const monthKey = month || this.getCurrentMonthKey();
    const key = `usage:${userId}:${monthKey}:messages`;

    try {
      await this.redis.del(key);
      this.logger.log(`Reset usage for user ${userId} (${monthKey})`);
    } catch (error) {
      this.logger.error(`Failed to reset usage for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get current month key in YYYY-MM format
   */
  private getCurrentMonthKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
}
