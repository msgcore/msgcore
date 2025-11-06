import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionStatus } from '../enums/subscription.enum';

/**
 * Guard that blocks API access for users with CANCELED, PAST_DUE, or UNPAID status
 *
 * Usage:
 * - Applied globally via APP_GUARD in app.module.ts
 * - Use @Public() decorator to bypass for public endpoints (signup, login, etc.)
 * - Use @AllowSuspended() decorator to allow access even when subscription has issues (billing endpoints)
 */
@Injectable()
export class SubscriptionStatusGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as @Public() or @AllowSuspended()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    const allowSuspended = this.reflector.getAllAndOverride<boolean>(
      'allowSuspended',
      [context.getHandler(), context.getClass()],
    );

    // Skip check for public routes or routes that explicitly allow suspended users
    if (isPublic || allowSuspended) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Extract user ID from auth context (set by AppAuthGuard)
    const authContext = request.authContext;

    // If no auth context (e.g., public endpoint or auth failure), let other guards handle it
    if (!authContext) {
      return true;
    }

    // API keys are project-scoped, check project owner's subscription status
    if (authContext.authType === 'api-key' && authContext.project) {
      const project = await this.prisma.project.findUnique({
        where: { id: authContext.project.id },
        include: { owner: true },
      });

      if (!project) {
        return true; // Let other guards handle missing project
      }

      return this.checkSubscriptionStatus(project.owner.subscriptionStatus);
    }

    // JWT users - check their own subscription status
    if (authContext.authType === 'jwt' && authContext.user?.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: authContext.user.userId },
      });

      if (!user) {
        return true; // Let other guards handle missing user
      }

      return this.checkSubscriptionStatus(user.subscriptionStatus);
    }

    // No user to check, allow (other guards will handle authentication)
    return true;
  }

  /**
   * Check if subscription status allows API access
   * Throws PaymentRequiredException for canceled/past due/unpaid accounts
   */
  private checkSubscriptionStatus(status: SubscriptionStatus): boolean {
    // Only block access for problematic statuses
    const blockedStatuses: SubscriptionStatus[] = ['PAST_DUE', 'CANCELED', 'UNPAID'];

    if (blockedStatuses.includes(status)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Subscription Issue',
          message: this.getStatusMessage(status),
          details: {
            status,
            action: 'update_payment',
            billingUrl: '/billing',
          },
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }

  private getStatusMessage(status: SubscriptionStatus): string {
    switch (status) {
      case 'PAST_DUE':
        return 'Your payment is past due. Please update your payment method to avoid service interruption.';
      case 'CANCELED':
        return 'Your subscription has been canceled. Please subscribe to a plan to continue using the service.';
      case 'UNPAID':
        return 'Your subscription payment failed. Please update your payment method.';
      default:
        return 'There is an issue with your subscription. Please contact support.';
    }
  }
}
