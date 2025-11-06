import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

export type BillingInterval = 'monthly' | 'annual';

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface CustomerPortalResult {
  url: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe | null;
  private readonly webhookSecret: string;
  private readonly priceIds: Record<string, string>;
  private readonly billingEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.billingEnabled = this.configService.get<string>('BILLING_ENABLED') === 'true';

    if (!this.billingEnabled) {
      this.logger.log('Billing is disabled. Stripe integration will not be initialized.');
      this.stripe = null;
      this.webhookSecret = '';
      this.priceIds = {};
      return;
    }

    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      this.logger.warn('STRIPE_SECRET_KEY is not configured. Billing features will be unavailable.');
      this.stripe = null;
      this.webhookSecret = '';
      this.priceIds = {};
      this.billingEnabled = false;
      return;
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-10-29.clover',
    });

    this.webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '';

    // Load price IDs from environment
    this.priceIds = {
      'STARTER-monthly': this.configService.get<string>('STRIPE_PRICE_STARTER_MONTHLY') || '',
      'STARTER-annual': this.configService.get<string>('STRIPE_PRICE_STARTER_ANNUAL') || '',
      'PRO-monthly': this.configService.get<string>('STRIPE_PRICE_PRO_MONTHLY') || '',
      'PRO-annual': this.configService.get<string>('STRIPE_PRICE_PRO_ANNUAL') || '',
      'BUSINESS-monthly': this.configService.get<string>('STRIPE_PRICE_BUSINESS_MONTHLY') || '',
      'BUSINESS-annual': this.configService.get<string>('STRIPE_PRICE_BUSINESS_ANNUAL') || '',
      'ENTERPRISE-monthly': this.configService.get<string>('STRIPE_PRICE_ENTERPRISE_MONTHLY') || '',
      'ENTERPRISE-annual': this.configService.get<string>('STRIPE_PRICE_ENTERPRISE_ANNUAL') || '',
    };

    this.logger.log('Stripe integration initialized successfully.');
  }

  /**
   * Check if billing is enabled
   */
  isBillingEnabled(): boolean {
    return this.billingEnabled && this.stripe !== null;
  }

  /**
   * Throw error if billing is disabled
   */
  private checkBillingEnabled(): void {
    if (!this.isBillingEnabled()) {
      throw new BadRequestException('Billing is not enabled on this instance');
    }
  }

  /**
   * Create a Stripe Checkout session for upgrading subscription
   */
  async createCheckoutSession(
    userId: string,
    tier: SubscriptionTier,
    interval: BillingInterval,
  ): Promise<CheckoutSessionResult> {
    this.checkBillingEnabled();

    // Validate tier (cannot checkout for FREE tier)
    if (tier === 'FREE') {
      throw new BadRequestException('Cannot create checkout session for FREE tier');
    }

    // Get price ID
    const priceKey = `${tier}-${interval}`;
    const priceId = this.priceIds[priceKey];
    if (!priceId) {
      throw new BadRequestException(`Price ID not configured for ${priceKey}`);
    }

    // Get or create Stripe customer
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await this.prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });

      this.logger.log(`Created Stripe customer ${customerId} for user ${userId}`);
    }

    // Get base URL for redirect
    const baseUrl = this.configService.get<string>('MSGCORE_API_URL') || 'http://localhost:7890';

    // Create checkout session with 7-day trial
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7, // 7-day trial with credit card required
        metadata: {
          userId: user.id,
          tier,
        },
      },
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing`,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        tier,
      },
    });

    this.logger.log(`Created checkout session ${session.id} for user ${userId} (${tier}, ${interval})`);

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  /**
   * Create a Stripe Customer Portal session for subscription management
   */
  async createCustomerPortalSession(userId: string): Promise<CustomerPortalResult> {
    this.checkBillingEnabled();

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.stripeCustomerId) {
      throw new BadRequestException('User does not have a Stripe customer account');
    }

    const baseUrl = this.configService.get<string>('MSGCORE_API_URL') || 'http://localhost:7890';

    const session = await this.stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/billing`,
    });

    this.logger.log(`Created customer portal session for user ${userId}`);

    return {
      url: session.url,
    };
  }

  /**
   * Handle incoming Stripe webhook events
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    this.checkBillingEnabled();

    if (!this.webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object as Stripe.Subscription);
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Error processing webhook ${event.type}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sync subscription data from Stripe
   */
  async syncSubscription(userId: string): Promise<void> {
    this.checkBillingEnabled();

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.stripeSubscriptionId) {
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(user.stripeSubscriptionId);
    await this.updateUserSubscription(user.id, subscription);
  }

  // ========== PRIVATE WEBHOOK HANDLERS ==========

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    if (!userId) {
      this.logger.warn('Checkout session missing userId in metadata');
      return;
    }

    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;

    if (!subscriptionId) {
      this.logger.warn('Checkout session missing subscription ID');
      return;
    }

    // Retrieve full subscription object
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    await this.updateUserSubscription(userId, subscription);

    this.logger.log(`Checkout completed for user ${userId}, subscription ${subscriptionId}`);
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      this.logger.warn('Subscription missing userId in metadata');
      return;
    }

    await this.updateUserSubscription(userId, subscription);
    this.logger.log(`Subscription created for user ${userId}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    // Find user by Stripe customer ID
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!user) {
      this.logger.warn(`User not found for Stripe customer ${subscription.customer}`);
      return;
    }

    await this.updateUserSubscription(user.id, subscription);
    this.logger.log(`Subscription updated for user ${user.id}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    // Find user by Stripe customer ID
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!user) {
      this.logger.warn(`User not found for Stripe customer ${subscription.customer}`);
      return;
    }

    // Downgrade to FREE tier
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'CANCELED',
        stripeSubscriptionId: null,
        subscriptionEndsAt: new Date(),
      },
    });

    this.logger.log(`Subscription deleted for user ${user.id}, downgraded to FREE`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      this.logger.warn(`User not found for Stripe customer ${customerId}`);
      return;
    }

    // Mark subscription as past due
    await this.prisma.user.update({
      where: { id: user.id },
      data: { subscriptionStatus: 'PAST_DUE' },
    });

    this.logger.log(`Payment failed for user ${user.id}, marked as PAST_DUE`);
  }

  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!user) {
      return;
    }

    // TODO: Send email notification about trial ending
    this.logger.log(`Trial ending soon for user ${user.id}`);
  }

  // ========== HELPER METHODS ==========

  /**
   * Update user subscription data based on Stripe subscription object
   */
  private async updateUserSubscription(userId: string, subscription: Stripe.Subscription): Promise<void> {
    // Extract tier from metadata or price
    const tier = this.extractTierFromSubscription(subscription);
    const status = this.mapStripeStatus(subscription.status);

    // Get period dates from subscription
    const currentPeriodStart = (subscription as any).current_period_start;
    const currentPeriodEnd = (subscription as any).current_period_end;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: status,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        subscriptionStartedAt: currentPeriodStart
          ? new Date(currentPeriodStart * 1000)
          : new Date(),
        subscriptionEndsAt: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      },
    });

    this.logger.log(`Updated user ${userId} subscription: ${tier} (${status})`);
  }

  /**
   * Extract subscription tier from Stripe subscription
   */
  private extractTierFromSubscription(subscription: Stripe.Subscription): SubscriptionTier {
    // Check metadata first
    if (subscription.metadata?.tier) {
      return subscription.metadata.tier as SubscriptionTier;
    }

    // Fall back to matching price ID
    const priceId = subscription.items.data[0]?.price.id;
    for (const [key, value] of Object.entries(this.priceIds)) {
      if (value === priceId) {
        const tier = key.split('-')[0] as SubscriptionTier;
        return tier;
      }
    }

    this.logger.warn(`Could not determine tier for subscription ${subscription.id}, defaulting to FREE`);
    return 'FREE';
  }

  /**
   * Map Stripe subscription status to our SubscriptionStatus enum
   */
  private mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return 'ACTIVE';
      case 'trialing':
        return 'TRIALING';
      case 'past_due':
        return 'PAST_DUE';
      case 'canceled':
      case 'unpaid':
        return 'CANCELED';
      case 'incomplete':
      case 'incomplete_expired':
        return 'UNPAID';
      default:
        return 'ACTIVE';
    }
  }
}
