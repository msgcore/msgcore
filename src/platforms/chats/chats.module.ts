import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlatformsModule } from '../platforms.module';

@Module({
  imports: [PrismaModule, PlatformsModule],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
