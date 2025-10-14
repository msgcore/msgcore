import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';
import { join } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // SPA fallback route - serves index.html for client-side routing
  // This handles browser refreshes on frontend routes like /messages, /projects, etc.
  @Public()
  @Get('*')
  serveFrontend(@Res() res: Response) {
    // Only handle non-API routes
    const indexPath = join(__dirname, '..', '..', 'web', 'dist', 'index.html');
    res.sendFile(indexPath);
  }
}
