import { ChatOpenAI } from '@langchain/openai';

/**
 * OpenRouter configuration utility for LangChain
 *
 * OpenRouter provides unified access to multiple LLM providers
 * through OpenAI-compatible API
 */
export class OpenRouterUtil {
  /**
   * Create a ChatOpenAI instance configured for OpenRouter
   *
   * @param model - Model identifier (e.g., 'anthropic/claude-3.5-sonnet', 'openai/gpt-4')
   * @param apiKey - OpenRouter API key (defaults to OPENROUTER_API_KEY env var)
   * @param temperature - Sampling temperature (0-1)
   * @returns Configured ChatOpenAI instance
   */
  static createChatModel(
    model: string = 'anthropic/claude-3.5-sonnet',
    apiKey?: string,
    temperature: number = 0.1,
  ): ChatOpenAI {
    const openrouterApiKey = apiKey || process.env.OPENROUTER_API_KEY;

    if (!openrouterApiKey) {
      throw new Error(
        'OPENROUTER_API_KEY environment variable is required for LLM extraction',
      );
    }

    return new ChatOpenAI({
      model,
      temperature,
      apiKey: openrouterApiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://msgcore.dev',
          'X-Title': 'MsgCore Analysis',
        },
      },
    });
  }

  /**
   * Recommended models for different use cases
   */
  static readonly RECOMMENDED_MODELS = {
    // Fast and cheap - good for simple extraction
    fast: 'anthropic/claude-3-haiku',

    // Balanced - good for most use cases
    balanced: 'anthropic/claude-3.5-sonnet',

    // High quality - for complex extraction
    powerful: 'anthropic/claude-3-opus',

    // OpenAI alternatives
    gpt4: 'openai/gpt-4-turbo',
    gpt35: 'openai/gpt-3.5-turbo',
  };
}
