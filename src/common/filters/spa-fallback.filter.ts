import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { join } from 'path';

@Catch(NotFoundException)
export class SpaFallbackFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.path;

    // Don't intercept API routes, MCP routes, or docs routes
    if (
      path.startsWith('/api/') ||
      path.startsWith('/mcp') ||
      path.startsWith('/docs/')
    ) {
      // Return 404 JSON for API routes
      return response.status(404).json({
        message: exception.message,
        error: 'Not Found',
        statusCode: 404,
      });
    }

    // Serve index.html for all other routes (SPA fallback)
    const indexPath = join(__dirname, '..', '..', '..', 'web', 'dist', 'index.html');
    response.sendFile(indexPath);
  }
}
