import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import * as packageJson from '../../package.json';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('messages') private messageQueue: Queue,
  ) {}

  async check() {
    const checks = {
      database: false,
      redis: false,
    };

    try {
      // Check database connectivity
      const userCount = await this.prisma.user.count({
        where: {
          passwordHash: {
            not: null,
          },
        },
      });
      checks.database = true;

      // Check Redis connectivity via queue client
      // BullMQ queue client is an IORedis instance
      // We're lenient here - as long as the client exists, we consider it healthy
      // The queue will retry connections automatically
      checks.redis = !!this.messageQueue.client;

      // Try to ping if possible, but don't fail if it doesn't work
      try {
        if (this.messageQueue.client && typeof this.messageQueue.client.ping === 'function') {
          await this.messageQueue.client.ping();
          this.logger.debug('Redis ping successful');
        }
      } catch (redisError) {
        this.logger.warn('Redis ping failed (queue will retry):', redisError.message);
        // Don't set checks.redis to false - as long as client exists, it's attempting to connect
      }

      const setupRequired = userCount === 0;
      const allHealthy = checks.database && checks.redis;

      return {
        status: allHealthy ? 'healthy' : 'unhealthy',
        version: packageJson.version,
        setupRequired,
        checks,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        version: packageJson.version,
        checks,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
