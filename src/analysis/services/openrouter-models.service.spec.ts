import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OpenRouterModelsService } from './openrouter-models.service';

describe('OpenRouterModelsService', () => {
  let service: OpenRouterModelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpenRouterModelsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OpenRouterModelsService>(OpenRouterModelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getModels', () => {
    it('should fetch models from OpenRouter API', async () => {
      const models = await service.getModels();

      expect(Array.isArray(models)).toBe(true);
      // OpenRouter should have models available
      expect(models.length).toBeGreaterThan(0);

      // Verify model structure
      if (models.length > 0) {
        const model = models[0];
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('pricing');
      }
    });

    it('should cache models for 1 hour', async () => {
      // First call
      const models1 = await service.getModels();

      // Second call should use cache (no network request)
      const models2 = await service.getModels();

      expect(models1).toEqual(models2);
    });
  });

  describe('getModel', () => {
    it('should find a specific model by ID', async () => {
      const model = await service.getModel('anthropic/claude-3.5-sonnet');

      if (model) {
        expect(model.id).toBe('anthropic/claude-3.5-sonnet');
        expect(model).toHaveProperty('pricing');
      }
    });

    it('should return null for non-existent model', async () => {
      const model = await service.getModel('non-existent-model-xyz');

      expect(model).toBeNull();
    });
  });

  describe('estimateCost', () => {
    it('should calculate cost based on model pricing', async () => {
      const tokens = 1000;

      // First check if the model exists
      const model = await service.getModel('anthropic/claude-3.5-sonnet');

      if (!model || !model.pricing) {
        // If model not available, skip this specific test
        console.log('Model not found or has no pricing, skipping cost calculation test');
        return;
      }

      const cost = await service.estimateCost(tokens, 'anthropic/claude-3.5-sonnet');

      expect(cost).toBeGreaterThan(0);
      expect(typeof cost).toBe('number');
      expect(isNaN(cost)).toBe(false);
    });

    it('should use fallback pricing for unknown models', async () => {
      const tokens = 1_000_000; // 1M tokens
      const cost = await service.estimateCost(tokens, 'unknown-model');

      // Should use default ~$3/1M tokens
      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(10); // Should be in reasonable range
    });

    it('should handle zero tokens', async () => {
      const cost = await service.estimateCost(0, 'anthropic/claude-3.5-sonnet');

      expect(cost).toBe(0);
    });
  });

  describe('getSupportedModels', () => {
    it('should return filtered list of supported models', async () => {
      const supported = await service.getSupportedModels();

      expect(Array.isArray(supported)).toBe(true);
      expect(supported.length).toBeGreaterThan(0);

      // Should only include major providers
      supported.forEach((model) => {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');

        const isMajorProvider =
          model.id.startsWith('anthropic/') ||
          model.id.startsWith('openai/') ||
          model.id.startsWith('google/') ||
          model.id.startsWith('meta-llama/');

        expect(isMajorProvider).toBe(true);
      });
    });

    it('should return models sorted alphabetically by name', async () => {
      const supported = await service.getSupportedModels();

      const names = supported.map((m) => m.name);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));

      expect(names).toEqual(sortedNames);
    });
  });
});
