import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppAuthGuard } from '../../common/guards/app-auth.guard';
import { SdkContract } from '../../common/decorators/sdk-contract.decorator';
import { ApiScope } from '../../common/enums/api-scopes.enum';
import { OpenRouterModelsService } from '../services/openrouter-models.service';
import { ModelResponse } from '../dto/model.response';

@Controller('api/v1/analysis/models')
@UseGuards(AppAuthGuard)
export class OpenRouterModelsController {
  constructor(private readonly modelsService: OpenRouterModelsService) {}

  @Get()
  @SdkContract({
    command: 'analysis models list',
    category: 'Analysis / Models',
    requiredScopes: [ApiScope.PROJECTS_READ],
    outputType: 'ModelResponse[]',
    description: 'List available LLM models from OpenRouter for analysis',
    examples: [
      {
        command: 'analysis models list',
        description: 'Get all supported models',
      },
    ],
  })
  async listModels() {
    return this.modelsService.getSupportedModels();
  }
}
