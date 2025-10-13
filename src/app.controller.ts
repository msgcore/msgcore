import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Root route removed - ServeStaticModule handles / for frontend
  // API routes are under /api/v1/*
}
