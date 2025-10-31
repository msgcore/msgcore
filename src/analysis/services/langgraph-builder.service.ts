import { Injectable, Logger } from '@nestjs/common';
import { StateGraph, END, START } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { OpenRouterUtil } from '../utils/openrouter.util';

/**
 * State interface for LangGraph execution
 */
export interface AnalysisState {
  messages: BaseMessage[];
  inputText: string;
  extractedEntities: Record<string, any>[];
  currentSchema: string;
  errors: string[];
}

/**
 * Entity schema definition for extraction
 */
export interface EntitySchemaDefinition {
  name: string;
  extractionType: 'llm_extraction' | 'rule_based' | 'api_logged';
  properties: Record<string, any>;
  prompt?: string;
  model?: string;
  temperature?: number;
  ruleDefinition?: Record<string, any>;
}

/**
 * LangGraph Builder Service
 *
 * Constructs dynamic LangGraph workflows for entity extraction
 * based on user-defined schemas and analysis profiles.
 */
@Injectable()
export class LangGraphBuilderService {
  private readonly logger = new Logger(LangGraphBuilderService.name);

  /**
   * Build a LangGraph workflow for extracting entities
   *
   * @param schemas - Array of entity schemas to extract
   * @param openrouterApiKey - Optional OpenRouter API key
   * @returns Compiled LangGraph workflow
   */
  buildExtractionGraph(
    schemas: EntitySchemaDefinition[],
    openrouterApiKey?: string,
  ) {
    const workflow = new StateGraph<AnalysisState>({
      channels: {
        messages: { value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y), default: () => [] },
        inputText: { value: (x: string, y: string) => y || x, default: () => '' },
        extractedEntities: { value: (x: any[], y: any[]) => x.concat(y), default: () => [] },
        currentSchema: { value: (x: string, y: string) => y || x, default: () => '' },
        errors: { value: (x: string[], y: string[]) => x.concat(y), default: () => [] },
      },
    });

    // Add extraction node for each schema
    for (const schema of schemas) {
      if (schema.extractionType === 'llm_extraction') {
        workflow.addNode(
          `extract_${schema.name}`,
          this.createLLMExtractionNode(schema, openrouterApiKey),
        );
      } else if (schema.extractionType === 'rule_based') {
        workflow.addNode(
          `extract_${schema.name}`,
          this.createRuleBasedExtractionNode(schema),
        );
      }
    }

    // Build linear chain: START -> schema1 -> schema2 -> ... -> END
    let previousNode: string = START;
    for (const schema of schemas) {
      const nodeName = `extract_${schema.name}`;
      workflow.addEdge(previousNode as any, nodeName as any);
      previousNode = nodeName;
    }
    workflow.addEdge(previousNode as any, END as any);

    return workflow.compile();
  }

  /**
   * Create an LLM extraction node
   */
  private createLLMExtractionNode(
    schema: EntitySchemaDefinition,
    openrouterApiKey?: string,
  ) {
    return async (state: AnalysisState): Promise<Partial<AnalysisState>> => {
      try {
        this.logger.debug(`Extracting ${schema.name} using LLM`);

        const model = OpenRouterUtil.createChatModel(
          schema.model || 'anthropic/claude-3.5-sonnet',
          openrouterApiKey,
          schema.temperature ?? 0.1,
        );

        const systemPrompt = this.buildSystemPrompt(schema);
        const userMessage = state.inputText;

        const response = await model.invoke([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ]);

        // Parse JSON response
        const content = response.content as string;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          throw new Error(`No JSON found in LLM response for ${schema.name}`);
        }

        const extracted = JSON.parse(jsonMatch[0]);

        return {
          extractedEntities: [
            {
              schemaName: schema.name,
              properties: extracted,
              confidence: 0.9, // TODO: Implement confidence scoring
            },
          ],
          currentSchema: schema.name,
        };
      } catch (error) {
        this.logger.error(
          `Error extracting ${schema.name}: ${error.message}`,
          error.stack,
        );
        return {
          errors: [`Failed to extract ${schema.name}: ${error.message}`],
          currentSchema: schema.name,
        };
      }
    };
  }

  /**
   * Create a rule-based extraction node
   */
  private createRuleBasedExtractionNode(schema: EntitySchemaDefinition) {
    return async (state: AnalysisState): Promise<Partial<AnalysisState>> => {
      try {
        this.logger.debug(`Extracting ${schema.name} using rules`);

        const extracted: Record<string, any> = {};
        const text = state.inputText;

        // Execute rule-based extraction
        if (schema.ruleDefinition) {
          for (const [key, rule] of Object.entries(schema.ruleDefinition)) {
            if (typeof rule === 'object' && 'regex' in rule) {
              const match = text.match(new RegExp(rule.regex as string));
              extracted[key] = match ? match[1] || match[0] : null;
            } else if (typeof rule === 'object' && 'contains' in rule) {
              extracted[key] = text.includes(rule.contains as string);
            }
          }
        }

        return {
          extractedEntities: [
            {
              schemaName: schema.name,
              properties: extracted,
              confidence: 1.0, // Rule-based is deterministic
            },
          ],
          currentSchema: schema.name,
        };
      } catch (error) {
        this.logger.error(
          `Error in rule-based extraction for ${schema.name}: ${error.message}`,
        );
        return {
          errors: [
            `Failed to extract ${schema.name} with rules: ${error.message}`,
          ],
          currentSchema: schema.name,
        };
      }
    };
  }

  /**
   * Build system prompt for LLM extraction
   */
  private buildSystemPrompt(schema: EntitySchemaDefinition): string {
    const propertyDescriptions = Object.entries(schema.properties)
      .map(([key, type]) => `- ${key}: ${type}`)
      .join('\n');

    return `You are an expert entity extraction system.

${schema.prompt || `Extract ${schema.name} entities from the provided text.`}

Extract the following properties:
${propertyDescriptions}

Return ONLY a valid JSON object with these exact property names. Do not include any explanation or additional text.

Example format:
{
  "property1": "value1",
  "property2": 123
}`;
  }
}
