#!/usr/bin/env ts-node
/**
 * Standalone Entity Extraction Test Script
 *
 * Tests LangGraph-based entity extraction with real OpenRouter API calls.
 * No database or server dependency - perfect for testing extraction logic.
 *
 * Usage:
 *   export OPENROUTER_API_KEY=your_key_here
 *   npx ts-node src/analysis/test-extraction-standalone.ts
 */

import { LangGraphBuilderService, EntitySchemaDefinition } from './services/langgraph-builder.service';
import { EntityExtractionService } from './services/entity-extraction.service';

// Test data: Sample customer message
const TEST_MESSAGE = `
Hi there! I'm really excited about your new pro plan.
I've been using the free tier for 3 months now and I love it!

My budget is around $50/month, and I need it for my team of 5 people.
Could you help me upgrade? My email is john.doe@example.com.

Looking forward to hearing from you!
John
`;

// Define entity schemas for testing
const SCHEMAS: EntitySchemaDefinition[] = [
  // Schema 1: Sentiment Analysis
  {
    name: 'Sentiment',
    extractionType: 'llm_extraction',
    properties: {
      score: 'number', // -1 to 1
      label: 'string', // positive, negative, neutral
      confidence: 'number', // 0 to 1
    },
    prompt: 'Analyze the sentiment of this message. Return a score from -1 (very negative) to 1 (very positive), a label (positive/negative/neutral), and your confidence level (0-1).',
    model: 'anthropic/claude-3.5-sonnet',
    temperature: 0.1,
  },

  // Schema 2: Contact Information (rule-based)
  {
    name: 'Contact',
    extractionType: 'rule_based',
    properties: {
      email: 'string',
      hasPhone: 'boolean',
    },
    ruleDefinition: {
      email: { regex: '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})' },
      hasPhone: { contains: 'phone' },
    },
  },

  // Schema 3: Buying Intent
  {
    name: 'BuyingIntent',
    extractionType: 'llm_extraction',
    properties: {
      intentScore: 'number', // 0 to 1
      budgetMentioned: 'boolean',
      budgetAmount: 'number',
      urgency: 'string', // low, medium, high
      planInterest: 'string',
    },
    prompt: 'Analyze this message for buying intent. Extract: intentScore (0-1 likelihood of purchase), whether budget was mentioned, budget amount if mentioned, urgency level (low/medium/high), and which plan they\'re interested in.',
    model: 'anthropic/claude-3-haiku', // Using cheaper model
    temperature: 0.2,
  },
];

/**
 * Main test function
 */
async function runTest() {
  console.log('🚀 Starting Standalone Entity Extraction Test\n');
  console.log('=' .repeat(80));

  // Check for API key
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ Error: OPENROUTER_API_KEY environment variable not set');
    console.error('   Set it with: export OPENROUTER_API_KEY=your_key_here\n');
    process.exit(1);
  }

  console.log('✅ OpenRouter API Key found\n');

  // Initialize services (no DI container needed)
  const langGraphBuilder = new LangGraphBuilderService();
  const extractionService = new EntityExtractionService(langGraphBuilder);

  console.log('📝 Test Message:');
  console.log('-'.repeat(80));
  console.log(TEST_MESSAGE);
  console.log('-'.repeat(80));
  console.log();

  console.log('🔍 Entity Schemas to Extract:');
  SCHEMAS.forEach((schema, i) => {
    console.log(`   ${i + 1}. ${schema.name} (${schema.extractionType})`);
  });
  console.log();

  try {
    console.log('⏳ Extracting entities... (this may take 10-30 seconds)\n');

    const result = await extractionService.extractEntities(
      TEST_MESSAGE,
      SCHEMAS,
      process.env.OPENROUTER_API_KEY,
    );

    console.log('=' .repeat(80));
    console.log('✨ EXTRACTION RESULTS');
    console.log('=' .repeat(80));
    console.log();

    // Display results
    if (result.entities.length > 0) {
      result.entities.forEach((entity, i) => {
        console.log(`📊 Entity ${i + 1}: ${entity.schemaName}`);
        console.log(`   Confidence: ${(entity.confidence * 100).toFixed(1)}%`);
        console.log(`   Properties:`);
        Object.entries(entity.properties).forEach(([key, value]) => {
          console.log(`      - ${key}: ${JSON.stringify(value)}`);
        });
        console.log();
      });
    } else {
      console.log('⚠️  No entities extracted');
    }

    // Display errors if any
    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach((error) => {
        console.log(`   - ${error}`);
      });
      console.log();
    }

    // Display metadata
    console.log('📈 Execution Metadata:');
    console.log(`   ⏱️  Execution Time: ${result.executionTimeMs}ms`);
    if (result.tokensUsed) {
      console.log(`   🎯 Tokens Used: ${result.tokensUsed}`);
    }
    console.log();

    console.log('=' .repeat(80));
    console.log('✅ Test completed successfully!');
    console.log('=' .repeat(80));
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
runTest().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
