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
      await this.messageQueue.client.ping();
      checks.redis = true;

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
