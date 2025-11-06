import { SubscriptionTier, SubscriptionStatus } from '../enums/subscription.enum';

export class SubscriptionResponseDto {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startedAt: Date | null;
  endsAt: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  isTrialing: boolean;
  daysUntilEnd: number | null;
}

export class ResourceUsage {
  current: number;
  limit: number;
  usagePercent: number;
  isApproachingLimit: boolean; // >= 80%
  isAtLimit: boolean; // >= 100%
  nextTier?: string;
}

export class UsageResponseDto {
  tier: SubscriptionTier;
  projects: ResourceUsage;
  platforms: ResourceUsage;
  messages: ResourceUsage;
  webhooks: ResourceUsage;
  teamMembers: ResourceUsage;
  warnings: string[];
}
