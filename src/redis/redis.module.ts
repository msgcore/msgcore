import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService) => {
        // Parse REDIS_URL if present (Dokku/Heroku format)
        const redisUrl = config.get<string>('REDIS_URL');

        if (redisUrl) {
          // Parse redis://[password@]host:port format
          const url = new URL(redisUrl);
          return new Redis({
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password || undefined,
            db: config.get<number>('REDIS_DB', 0),
            tls: url.hostname.includes('upstash.io') ? {} : undefined,
            maxRetriesPerRequest: null,
          });
        }

        // Fallback to individual env vars
        return new Redis({
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
          db: config.get<number>('REDIS_DB', 0),
          tls: config.get<string>('REDIS_HOST', '').includes('upstash.io')
            ? {}
            : undefined,
          maxRetriesPerRequest: null,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
