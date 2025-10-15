import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SentryHealthIndicator } from './sentry.health';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'messages',
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService, SentryHealthIndicator],
  exports: [SentryHealthIndicator],
})
export class HealthModule {}
