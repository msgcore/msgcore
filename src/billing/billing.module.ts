import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TierLimitsService } from './tier-limits.service';
import { StripeService } from './stripe.service';
import { UsageTrackerService } from './usage-tracker.service';
import { DowngradeHandlerService } from './downgrade-handler.service';
import { BillingController } from './billing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, ConfigModule, RedisModule],
  providers: [TierLimitsService, StripeService, UsageTrackerService, DowngradeHandlerService],
  controllers: [BillingController],
  exports: [TierLimitsService, StripeService, UsageTrackerService, DowngradeHandlerService],
})
export class BillingModule {}
