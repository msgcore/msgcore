import { Injectable, Logger } from '@nestjs/common';
import {
  LangGraphBuilderService,
  EntitySchemaDefinition,
} from './langgraph-builder.service';
import type { AnalysisState } from './langgraph-builder.service';

/**
 * Extraction result for a single entity
 */
export interface ExtractedEntityResult {
  schemaName: string;
  properties: Record<string, any>;
  confidence: number;
}

/**
 * Overall extraction result
 */
export interface ExtractionResult {
  entities: ExtractedEntityResult[];
  errors: string[];
  tokensUsed?: number;
  executionTimeMs: number;
}

/**
 * Entity Extraction Service
 *
 * High-level service for extracting entities from text using LLMs or rules.
 * This service is database-independent and can be tested standalone.
 */
@Injectable()
export class EntityExtractionService {
  private readonly logger = new Logger(EntityExtractionService.name);

  constructor(
    private readonly langGraphBuilder: LangGraphBuilderService,
  ) {}

  /**
   * Extract entities from text using provided schemas
   *
   * @param inputText - Text to analyze
   * @param schemas - Entity schemas to apply
   * @param openrouterApiKey - Optional OpenRouter API key (uses env var if not provided)
   * @returns Extraction result with entities and metadata
   */
  async extractEntities(
    inputText: string,
    schemas: EntitySchemaDefinition[],
    openrouterApiKey?: string,
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    try {
      this.logger.log(
        `Starting entity extraction with ${schemas.length} schema(s)`,
      );

      // Build LangGraph workflow
      const graph = this.langGraphBuilder.buildExtractionGraph(
        schemas,
        openrouterApiKey,
      );

      // Execute workflow
      const initialState: AnalysisState = {
        messages: [],
        inputText,
        extractedEntities: [],
        currentSchema: '',
        errors: [],
      };

      const result = (await graph.invoke(initialState as any)) as unknown as AnalysisState;

      const executionTimeMs = Date.now() - startTime;

      this.logger.log(
        `Extraction completed in ${executionTimeMs}ms, extracted ${result.extractedEntities.length} entities`,
      );

      return {
        entities: result.extractedEntities as ExtractedEntityResult[],
        errors: result.errors,
        executionTimeMs,
      };
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;

      this.logger.error(
        `Entity extraction failed: ${error.message}`,
        error.stack,
      );

      return {
        entities: [],
        errors: [`Extraction failed: ${error.message}`],
        executionTimeMs,
      };
    }
  }

  /**
   * Extract entities from a single schema (convenience method)
   */
  async extractSingleSchema(
    inputText: string,
    schema: EntitySchemaDefinition,
    openrouterApiKey?: string,
  ): Promise<ExtractionResult> {
    return this.extractEntities(inputText, [schema], openrouterApiKey);
  }

  /**
   * Batch extract entities from multiple texts
   */
  async extractBatch(
    inputs: { text: string; schemas: EntitySchemaDefinition[] }[],
    openrouterApiKey?: string,
  ): Promise<ExtractionResult[]> {
    this.logger.log(`Starting batch extraction for ${inputs.length} inputs`);

    const results = await Promise.all(
      inputs.map((input) =>
        this.extractEntities(input.text, input.schemas, openrouterApiKey),
      ),
    );

    return results;
  }
}
