/**
 * Subscription tier levels
 * Re-exported from Prisma schema for SDK generation
 */
export enum SubscriptionTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
  ENTERPRISE = 'ENTERPRISE',
}

/**
 * Subscription status states
 * Re-exported from Prisma schema for SDK generation
 */
export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING',
  UNPAID = 'UNPAID',
}
