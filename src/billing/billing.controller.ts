import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { AppAuthGuard } from '../common/guards/app-auth.guard';
import { AuthContextParam } from '../common/decorators/auth-context.decorator';
import type { AuthContext } from '../common/utils/security.util';
import { Public } from '../common/decorators/public.decorator';
import { AllowSuspended } from './decorators/allow-suspended.decorator';
import { SdkContract } from '../common/decorators/sdk-contract.decorator';
import { StripeService } from './stripe.service';
import { UsageTrackerService } from './usage-tracker.service';
import { DowngradeHandlerService } from './downgrade-handler.service';
import { TierLimitsService } from './tier-limits.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import {
  SubscriptionResponseDto,
  UsageResponseDto,
} from './dto/subscription-response.dto';
import {
  CheckoutResponseDto,
  PortalResponseDto,
  SyncResponseDto,
} from './dto/checkout-response.dto';

@Controller('api/v1/billing')
@AllowSuspended() // Allow suspended users to access billing endpoints to update payment
export class BillingController {
  private readonly logger = new Logger(BillingController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly usageTracker: UsageTrackerService,
    private readonly downgradeHandler: DowngradeHandlerService,
    private readonly tierLimitsService: TierLimitsService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Create Stripe Checkout session for subscription upgrade
   */
  @Post('checkout')
  @UseGuards(AppAuthGuard)
  @HttpCode(HttpStatus.OK)
  @SdkContract({
    command: 'billing checkout',
    description: 'Create Stripe checkout session for subscription upgrade',
    category: 'Billing',
    requiredScopes: [],
    inputType: 'CreateCheckoutDto',
    outputType: 'CheckoutResponseDto',
    options: {
      tier: {
        required: true,
        description: 'Subscription tier',
        choices: ['STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'],
        type: 'string',
      },
      interval: {
        required: true,
        description: 'Billing interval',
        choices: ['monthly', 'annual'],
        type: 'string',
      },
    },
    examples: [
      {
        description: 'Upgrade to PRO monthly',
        command: 'msgcore billing checkout --tier PRO --interval monthly',
      },
      {
        description: 'Upgrade to STARTER annually',
        command: 'msgcore billing checkout --tier STARTER --interval annual',
      },
    ],
  })
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @AuthContextParam() authContext: AuthContext,
  ): Promise<CheckoutResponseDto> {
    if (!authContext.user?.userId) {
      throw new Error('User ID not found in auth context');
    }

    const result = await this.stripeService.createCheckoutSession(
      authContext.user.userId,
      dto.tier,
      dto.interval,
    );

    this.logger.log(
      `Checkout session created for user ${authContext.user.userId}: ${dto.tier} (${dto.interval})`,
    );

    return result;
  }

  /**
   * Create Stripe Customer Portal session for subscription management
   */
  @Post('portal')
  @UseGuards(AppAuthGuard)
  @HttpCode(HttpStatus.OK)
  @SdkContract({
    command: 'billing portal',
    description: 'Access Stripe customer portal to manage subscription',
    category: 'Billing',
    requiredScopes: [],
    outputType: 'PortalResponseDto',
    examples: [
      {
        description: 'Open billing portal',
        command: 'msgcore billing portal',
      },
    ],
  })
  async createPortal(@AuthContextParam() authContext: AuthContext): Promise<PortalResponseDto> {
    if (!authContext.user?.userId) {
      throw new Error('User ID not found in auth context');
    }

    const result = await this.stripeService.createCustomerPortalSession(authContext.user.userId);

    this.logger.log(`Customer portal session created for user ${authContext.user.userId}`);

    return result;
  }

  /**
   * Webhook endpoint for Stripe events (PUBLIC - no authentication)
   */
  @Post('webhook')
  @Public()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    if (!req.rawBody) {
      throw new Error('Missing raw body');
    }

    await this.stripeService.handleWebhook(req.rawBody, signature);

    return { received: true };
  }

  /**
   * Get current subscription details
   */
  @Get('subscription')
  @UseGuards(AppAuthGuard)
  @SdkContract({
    command: 'billing subscription',
    description: 'Get current subscription details including tier, status, and trial info',
    category: 'Billing',
    requiredScopes: [],
    outputType: 'SubscriptionResponseDto',
    examples: [
      {
        description: 'View subscription details',
        command: 'msgcore billing subscription',
      },
    ],
  })
  async getSubscription(
    @AuthContextParam() authContext: AuthContext,
  ): Promise<SubscriptionResponseDto> {
    if (!authContext.user?.userId) {
      throw new Error('User ID not found in auth context');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: authContext.user.userId },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionStartedAt: true,
        subscriptionEndsAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isTrialing = user.subscriptionStatus === 'TRIALING';
    const daysUntilEnd = user.subscriptionEndsAt
      ? Math.ceil((user.subscriptionEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      startedAt: user.subscriptionStartedAt,
      endsAt: user.subscriptionEndsAt,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      isTrialing,
      daysUntilEnd,
    };
  }

  /**
   * Get current usage statistics across all resources with warnings
   */
  @Get('usage')
  @UseGuards(AppAuthGuard)
  @SdkContract({
    command: 'billing usage',
    description: 'Get usage statistics for projects, messages, platforms, webhooks with limit warnings',
    category: 'Billing',
    requiredScopes: [],
    outputType: 'UsageResponseDto',
    examples: [
      {
        description: 'View usage statistics',
        command: 'msgcore billing usage',
      },
    ],
  })
  async getUsage(@AuthContextParam() authContext: AuthContext): Promise<UsageResponseDto> {
    if (!authContext.user?.userId) {
      throw new Error('User ID not found in auth context');
    }

    const userId = authContext.user.userId;

    // Get user and their tier limits
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const limits = this.tierLimitsService.getLimits(user.subscriptionTier);
    const userUsage = await this.tierLimitsService.getUserUsage(userId);
    const messageStats = await this.usageTracker.getUsageStats(userId);
    const nextTier = this.tierLimitsService.getNextTier(user.subscriptionTier);

    // Helper to calculate resource usage
    const calculateResourceUsage = (current: number, limit: number) => {
      const usagePercent = limit === -1 ? 0 : Math.round((current / limit) * 100);
      const isApproachingLimit = limit !== -1 && usagePercent >= 80;
      const isAtLimit = limit !== -1 && usagePercent >= 100;
      return {
        current,
        limit,
        usagePercent,
        isApproachingLimit,
        isAtLimit,
        nextTier: nextTier || undefined,
      };
    };

    const projects = calculateResourceUsage(userUsage.projects, limits.projects);
    const platforms = calculateResourceUsage(userUsage.platforms, limits.platformsPerProject);
    const messages = calculateResourceUsage(
      messageStats.messagesThisMonth,
      messageStats.messageLimit,
    );
    const webhooks = calculateResourceUsage(userUsage.webhooks, limits.webhooks);
    const teamMembers = calculateResourceUsage(userUsage.teamMembers, limits.teamMembers);

    // Generate warnings
    const warnings: string[] = [];
    if (projects.isAtLimit) {
      warnings.push(
        `You've reached your project limit (${limits.projects}). Upgrade to create more projects.`,
      );
    } else if (projects.isApproachingLimit) {
      warnings.push(
        `You're approaching your project limit (${projects.current}/${limits.projects}).`,
      );
    }

    if (messages.isAtLimit) {
      warnings.push(
        `You've reached your message limit (${limits.messagesPerMonth}). Upgrade to send more messages.`,
      );
    } else if (messages.isApproachingLimit) {
      warnings.push(
        `You're approaching your message limit (${messages.current}/${limits.messagesPerMonth}).`,
      );
    }

    if (platforms.isApproachingLimit && limits.platformsPerProject !== -1) {
      warnings.push(
        `You're approaching your platform limit (${platforms.current}/${limits.platformsPerProject}).`,
      );
    }

    return {
      tier: user.subscriptionTier,
      projects,
      platforms,
      messages,
      webhooks,
      teamMembers,
      warnings,
    };
  }

  /**
   * Get suspension information (for displaying warnings in UI)
   */
  @Get('suspension-info')
  @UseGuards(AppAuthGuard)
  async getSuspensionInfo(@AuthContextParam() authContext: AuthContext) {
    if (!authContext.user?.userId) {
      throw new Error('User ID not found in auth context');
    }

    return this.downgradeHandler.getSuspensionInfo(authContext.user.userId);
  }

  /**
   * Sync subscription from Stripe (manual refresh)
   */
  @Post('sync')
  @UseGuards(AppAuthGuard)
  @HttpCode(HttpStatus.OK)
  @SdkContract({
    command: 'billing sync',
    description: 'Manually sync subscription data from Stripe',
    category: 'Billing',
    requiredScopes: [],
    outputType: 'SyncResponseDto',
    examples: [
      {
        description: 'Sync subscription from Stripe',
        command: 'msgcore billing sync',
      },
    ],
  })
  async syncSubscription(@AuthContextParam() authContext: AuthContext): Promise<SyncResponseDto> {
    if (!authContext.user?.userId) {
      throw new Error('User ID not found in auth context');
    }

    await this.stripeService.syncSubscription(authContext.user.userId);

    this.logger.log(`Subscription synced for user ${authContext.user.userId}`);

    return { synced: true };
  }
}
