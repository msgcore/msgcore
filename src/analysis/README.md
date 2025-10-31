# MsgCore Analysis System

Generic entity extraction and analysis framework for MsgCore.

## Architecture

### Core Concepts

- **Entity Schemas**: User-defined templates for what to extract
- **Analysis Profiles**: Workflows that combine multiple schemas
- **Analysis Runs**: Execution instances tracking progress
- **Extracted Entities**: Results stored per identity/chat
- **Replayable**: Profile versioning allows re-analysis without data loss

### Extraction Methods

1. **LLM Extraction** (`llm_extraction`): Uses OpenRouter + LangGraph for intelligent extraction
2. **Rule-Based** (`rule_based`): Regex and pattern matching
3. **API-Logged** (`api_logged`): Entities provided by external systems

## Testing (Standalone - No DB Required)

### Prerequisites

```bash
# Get your OpenRouter API key from https://openrouter.ai/
export OPENROUTER_API_KEY=your_key_here
```

### Run the Test

```bash
npx ts-node src/analysis/test-extraction-standalone.ts
```

### What the Test Does

1. **Sentiment Analysis** (LLM) - Extracts emotional tone
2. **Contact Info** (Rules) - Finds email addresses
3. **Buying Intent** (LLM) - Detects purchase signals

The test runs against a sample customer message and shows:
- Extracted entities with confidence scores
- Execution time
- Any errors encountered

### Expected Output

```
🚀 Starting Standalone Entity Extraction Test
===============================================================================
✅ OpenRouter API Key found

📝 Test Message:
...

⏳ Extracting entities... (this may take 10-30 seconds)

===============================================================================
✨ EXTRACTION RESULTS
===============================================================================

📊 Entity 1: Sentiment
   Confidence: 90.0%
   Properties:
      - score: 0.8
      - label: "positive"
      - confidence: 0.9

📊 Entity 2: Contact
   Confidence: 100.0%
   Properties:
      - email: "john.doe@example.com"
      - hasPhone: false

📊 Entity 3: BuyingIntent
   Confidence: 90.0%
   Properties:
      - intentScore: 0.85
      - budgetMentioned: true
      - budgetAmount: 50
      - urgency: "medium"
      - planInterest: "pro plan"

📈 Execution Metadata:
   ⏱️  Execution Time: 2341ms

===============================================================================
✅ Test completed successfully!
===============================================================================
```

## Components

### Services

- **`EntitySchemaService`**: CRUD for entity schemas (DB-dependent)
- **`LangGraphBuilderService`**: Builds dynamic LangGraph workflows
- **`EntityExtractionService`**: Orchestrates extraction (DB-independent)

### Utils

- **`OpenRouterUtil`**: OpenRouter configuration for LangChain

### Controllers

- **`EntitySchemasController`**: REST API for schema management

## OpenRouter Models

Recommended models (via `OpenRouterUtil.RECOMMENDED_MODELS`):

- **`fast`**: `anthropic/claude-3-haiku` - Quick, cheap
- **`balanced`**: `anthropic/claude-3.5-sonnet` - Best quality/cost (default)
- **`powerful`**: `anthropic/claude-3-opus` - Highest quality
- **`gpt4`**: `openai/gpt-4-turbo` - OpenAI alternative

## Next Steps (Phase 1B)

- [ ] Create `AnalysisProfileService` for profile CRUD
- [ ] Create `AnalysisRunService` for execution tracking
- [ ] Hook into message reception for real-time analysis
- [ ] Add retroactive analysis queue worker
- [ ] Persist extraction results to database

## Example: Custom Entity Schema

```typescript
const schema: EntitySchemaDefinition = {
  name: 'ProductMention',
  extractionType: 'llm_extraction',
  properties: {
    productName: 'string',
    sentiment: 'string', // positive, negative, neutral
    issueType: 'string', // bug, feature_request, question
  },
  prompt: 'Extract product mentions and categorize feedback.',
  model: 'anthropic/claude-3.5-sonnet',
  temperature: 0.1,
};
```

## Environment Variables

```bash
# Required for LLM extraction
OPENROUTER_API_KEY=your_openrouter_key

# Optional: Override default model
DEFAULT_ANALYSIS_MODEL=anthropic/claude-3.5-sonnet
```
