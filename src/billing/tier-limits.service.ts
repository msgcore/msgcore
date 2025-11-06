import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionTier } from '@prisma/client';

export interface TierLimits {
  projects: number; // -1 = unlimited
  messagesPerMonth: number;
  platformsPerProject: number; // -1 = unlimited
  historyDays: number;
  webhooks: number;
  teamMembers: number; // -1 = unlimited
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  FREE: {
    projects: 1,
    messagesPerMonth: 1000,
    platformsPerProject: 2,
    historyDays: 7,
    webhooks: 0,
    teamMembers: 3,
  },
  STARTER: {
    projects: 5,
    messagesPerMonth: 10000,
    platformsPerProject: -1, // unlimited
    historyDays: 30,
    webhooks: 5,
    teamMembers: 10,
  },
  PRO: {
    projects: -1, // unlimited
    messagesPerMonth: 50000,
    platformsPerProject: -1,
    historyDays: 90,
    webhooks: 50,
    teamMembers: -1, // unlimited
  },
  BUSINESS: {
    projects: -1,
    messagesPerMonth: 500000,
    platformsPerProject: -1,
    historyDays: 365,
    webhooks: -1, // unlimited
    teamMembers: -1,
  },
  ENTERPRISE: {
    projects: -1,
    messagesPerMonth: -1, // unlimited
    platformsPerProject: -1,
    historyDays: -1, // unlimited
    webhooks: -1,
    teamMembers: -1,
  },
};

export class PaymentRequiredException extends HttpException {
  constructor(details: {
    message: string;
    currentTier: SubscriptionTier;
    currentLimit: number;
    currentUsage: number;
    upgradeUrl: string;
    nextTier?: SubscriptionTier;
  }) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        error: 'Payment Required',
        message: details.message,
        details: {
          currentTier: details.currentTier,
          currentLimit: details.currentLimit,
          currentUsage: details.currentUsage,
          nextTier: details.nextTier,
          upgradeUrl: details.upgradeUrl,
        },
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}

@Injectable()
export class TierLimitsService {
  constructor(private prisma: PrismaService) {}

  getLimits(tier: SubscriptionTier): TierLimits {
    return TIER_LIMITS[tier];
  }

  getNextTier(currentTier: SubscriptionTier): SubscriptionTier | null {
    const tierOrder: SubscriptionTier[] = [
      'FREE',
      'STARTER',
      'PRO',
      'BUSINESS',
      'ENTERPRISE',
    ];
    const currentIndex = tierOrder.indexOf(currentTier);
    return currentIndex < tierOrder.length - 1
      ? tierOrder[currentIndex + 1]
      : null;
  }

  /**
   * Check if user can create a new project
   * Throws PaymentRequiredException if limit exceeded
   */
  async checkProjectLimit(userId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: { ownedProjects: true },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const limits = this.getLimits(user.subscriptionTier);
    const currentProjects = user._count.ownedProjects;

    // -1 means unlimited
    if (limits.projects !== -1 && currentProjects >= limits.projects) {
      const nextTier = this.getNextTier(user.subscriptionTier);

      throw new PaymentRequiredException({
        message: `Your ${user.subscriptionTier} plan is limited to ${limits.projects} project${limits.projects === 1 ? '' : 's'}. Upgrade to create more.`,
        currentTier: user.subscriptionTier,
        currentLimit: limits.projects,
        currentUsage: currentProjects,
        upgradeUrl: `${process.env.APP_URL || 'http://localhost:3000'}/billing/upgrade`,
        nextTier: nextTier || undefined,
      });
    }
  }

  /**
   * Check if project can add more platforms
   */
  async checkPlatformLimit(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        _count: {
          select: { projectPlatforms: true },
        },
      },
    });

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    const limits = this.getLimits(project.owner.subscriptionTier);
    const currentPlatforms = project._count.projectPlatforms;

    if (
      limits.platformsPerProject !== -1 &&
      currentPlatforms >= limits.platformsPerProject
    ) {
      const nextTier = this.getNextTier(project.owner.subscriptionTier);

      throw new PaymentRequiredException({
        message: `Your ${project.owner.subscriptionTier} plan is limited to ${limits.platformsPerProject} platform${limits.platformsPerProject === 1 ? '' : 's'} per project.`,
        currentTier: project.owner.subscriptionTier,
        currentLimit: limits.platformsPerProject,
        currentUsage: currentPlatforms,
        upgradeUrl: `${process.env.APP_URL || 'http://localhost:3000'}/billing/upgrade`,
        nextTier: nextTier || undefined,
      });
    }
  }

  /**
   * Check if project can add more webhooks
   */
  async checkWebhookLimit(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        _count: {
          select: { webhooks: true },
        },
      },
    });

    if (!project) {
      throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
    }

    const limits = this.getLimits(project.owner.subscriptionTier);
    const currentWebhooks = project._count.webhooks;

    if (limits.webhooks !== -1 && currentWebhooks >= limits.webhooks) {
      const nextTier = this.getNextTier(project.owner.subscriptionTier);

      throw new PaymentRequiredException({
        message: `Your ${project.owner.subscriptionTier} plan is limited to ${limits.webhooks} webhook${limits.webhooks === 1 ? '' : 's'}.`,
        currentTier: project.owner.subscriptionTier,
        currentLimit: limits.webhooks,
        currentUsage: currentWebhooks,
        upgradeUrl: `${process.env.APP_URL || 'http://localhost:3000'}/billing/upgrade`,
        nextTier: nextTier || undefined,
      });
    }
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            ownedProjects: true,
          },
        },
        ownedProjects: {
          select: {
            id: true,
            _count: {
              select: {
                projectPlatforms: true,
                webhooks: true,
                members: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const limits = this.getLimits(user.subscriptionTier);

    // Calculate total platforms across all projects
    const totalPlatforms = user.ownedProjects.reduce(
      (sum, project) => sum + project._count.projectPlatforms,
      0,
    );

    // Calculate total webhooks across all projects
    const totalWebhooks = user.ownedProjects.reduce(
      (sum, project) => sum + project._count.webhooks,
      0,
    );

    // Calculate total team members across all projects (distinct members)
    const totalTeamMembers = user.ownedProjects.reduce(
      (sum, project) => sum + project._count.members,
      0,
    );

    return {
      tier: user.subscriptionTier,
      limits,
      projects: user._count.ownedProjects,
      platforms: totalPlatforms,
      webhooks: totalWebhooks,
      teamMembers: totalTeamMembers,
    };
  }

  /**
   * Check if user can send messages (enforce monthly quota)
   */
  async checkMessageQuota(userId: string): Promise<void> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    // Get user and their current usage
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        messageUsage: {
          where: {
            year,
            month,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const limits = this.getLimits(user.subscriptionTier);

    // -1 means unlimited
    if (limits.messagesPerMonth === -1) {
      return;
    }

    const currentUsage = user.messageUsage[0];
    const messagesSent = currentUsage?.messagesSent || 0;

    if (messagesSent >= limits.messagesPerMonth) {
      const nextTier = this.getNextTier(user.subscriptionTier);

      throw new PaymentRequiredException({
        message: `Your ${user.subscriptionTier} plan is limited to ${limits.messagesPerMonth} messages per month. Upgrade to send more.`,
        currentTier: user.subscriptionTier,
        currentLimit: limits.messagesPerMonth,
        currentUsage: messagesSent,
        upgradeUrl: `${process.env.APP_URL || 'http://localhost:3000'}/billing/upgrade`,
        nextTier: nextTier || undefined,
      });
    }
  }

  /**
   * Increment message count for a user (call when message is sent)
   */
  async incrementMessageCount(
    userId: string,
    type: 'sent' | 'received' = 'sent',
  ): Promise<void> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    await this.prisma.messageUsage.upsert({
      where: {
        userId_year_month: {
          userId,
          year,
          month,
        },
      },
      create: {
        userId,
        year,
        month,
        messagesSent: type === 'sent' ? 1 : 0,
        messagesReceived: type === 'received' ? 1 : 0,
      },
      update: {
        messagesSent: type === 'sent' ? { increment: 1 } : undefined,
        messagesReceived: type === 'received' ? { increment: 1 } : undefined,
      },
    });
  }

  /**
   * Get user's message usage for current month
   */
  async getMessageUsage(
    userId: string,
  ): Promise<{ sent: number; received: number; limit: number; tier: SubscriptionTier }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        messageUsage: {
          where: { year, month },
        },
      },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const limits = this.getLimits(user.subscriptionTier);
    const usage = user.messageUsage[0];

    return {
      sent: usage?.messagesSent || 0,
      received: usage?.messagesReceived || 0,
      limit: limits.messagesPerMonth,
      tier: user.subscriptionTier,
    };
  }

  /**
   * Check if user can access a feature based on their tier
   */
  canAccessFeature(tier: SubscriptionTier, feature: keyof TierLimits): boolean {
    const limits = this.getLimits(tier);
    const limit = limits[feature];

    // -1 means unlimited/available
    if (typeof limit === 'number') {
      return limit !== 0;
    }

    return true;
  }
}
