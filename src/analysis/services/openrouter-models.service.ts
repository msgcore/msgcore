import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: number;  // per token
    completion: number;  // per token
  };
  context_length: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
    instruct_type?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

@Injectable()
export class OpenRouterModelsService {
  private readonly logger = new Logger(OpenRouterModelsService.name);
  private modelsCache: OpenRouterModel[] | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  constructor(private readonly configService: ConfigService) {}

  async getModels(): Promise<OpenRouterModel[]> {
    const now = Date.now();

    // Return cached models if still valid
    if (this.modelsCache && (now - this.lastFetchTime) < this.CACHE_TTL) {
      return this.modelsCache;
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API returned ${response.status}`);
      }

      const data: OpenRouterModelsResponse = await response.json();
      this.modelsCache = data.data;
      this.lastFetchTime = now;

      this.logger.log(`Fetched ${this.modelsCache.length} models from OpenRouter`);

      return this.modelsCache;
    } catch (error) {
      this.logger.error(`Failed to fetch models from OpenRouter: ${error.message}`);

      // Return cached models if available, even if expired
      if (this.modelsCache) {
        this.logger.warn('Using expired model cache due to fetch failure');
        return this.modelsCache;
      }

      // Return empty array as fallback
      return [];
    }
  }

  async getModel(modelId: string): Promise<OpenRouterModel | null> {
    const models = await this.getModels();
    return models.find((m) => m.id === modelId) || null;
  }

  async estimateCost(tokens: number, modelId: string): Promise<number> {
    if (tokens === 0) {
      return 0;
    }

    const model = await this.getModel(modelId);

    if (!model || !model.pricing) {
      // Fallback to default pricing if model not found
      this.logger.warn(
        `Model ${modelId} not found or has no pricing, using default pricing estimate`,
      );
      return (tokens / 1_000_000) * 3.0; // Default to ~$3/1M tokens
    }

    // Get pricing values, defaulting to 0 if undefined
    const promptPrice = Number(model.pricing.prompt) || 0;
    const completionPrice = Number(model.pricing.completion) || 0;

    if (promptPrice === 0 && completionPrice === 0) {
      // No valid pricing, use fallback
      this.logger.warn(
        `Model ${modelId} has zero pricing, using default estimate`,
      );
      return (tokens / 1_000_000) * 3.0;
    }

    // OpenRouter pricing is per token (very small numbers)
    // Calculate average cost (assuming 50/50 input/output split)
    const avgPricePerToken = (promptPrice + completionPrice) / 2;
    const cost = tokens * avgPricePerToken;

    return cost;
  }

  async getSupportedModels(): Promise<
    Array<{ id: string; name: string; description?: string }>
  > {
    const models = await this.getModels();

    // Filter for models commonly used for analysis
    // Prioritize Anthropic, OpenAI, and other major providers
    const supportedModels = models
      .filter((m) => {
        // Filter out models without pricing
        if (!m.pricing || !m.pricing.prompt) return false;

        // Include major providers
        return (
          m.id.startsWith('anthropic/') ||
          m.id.startsWith('openai/') ||
          m.id.startsWith('google/') ||
          m.id.startsWith('meta-llama/')
        );
      })
      .map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return supportedModels;
  }
}
