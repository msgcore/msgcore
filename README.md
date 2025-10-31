# MsgCore

Universal messaging infrastructure for AI agents. Send messages across Discord, Telegram, WhatsApp, and Email with a single API.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Discord Community](https://img.shields.io/badge/Discord-Join-7289da?logo=discord)](https://discord.gg/bQPsvycW)

## Features

- **Universal API** - One interface for Discord, Telegram, WhatsApp (Evolution API), Email
- **Message Storage** - Complete conversation history with cross-platform user identities
- **Developer Tools** - TypeScript SDK, CLI, and n8n nodes
- **Webhook Events** - Subscribe to messages, reactions, and button clicks
- **Multi-Tenant** - User/project management with role-based access
- **MCP Support** - Native Model Context Protocol (HTTP server + stdio CLI)

## Quick Start

```bash
# Start infrastructure
docker compose up -d postgres redis

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env - set JWT_SECRET and ENCRYPTION_KEY

# Run migrations and start server
npm run start:dev
```

Server runs on `http://localhost:7890`

## Docker Deployment

### Quick Start with Docker Hub

Pull and run the official Docker image:

```bash
# Pull the latest image
docker pull filipeai/msgcore:latest

# Run with external databases
docker run -d \
  --name msgcore \
  -p 7890:7890 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/msgcore?schema=public" \
  -e REDIS_URL="redis://:password@host:6379" \
  -e JWT_SECRET="your-32-char-secret" \
  -e ENCRYPTION_KEY="your-32-char-key" \
  filipeai/msgcore:latest
```

### Using Docker Compose (External Databases)

For production deployments with managed database services (AWS RDS, DigitalOcean, etc.):

```bash
# Copy environment template
cp .env.docker.example .env

# Edit .env with your external database credentials
nano .env

# Run with external databases
docker compose -f docker-compose.external-db.yml up -d
```

**Example `.env` configuration:**

```bash
DATABASE_URL=postgresql://admin:pass@your-rds.amazonaws.com:5432/msgcore?schema=public
REDIS_URL=redis://:password@your-redis.cloud:6379
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
MSGCORE_API_URL=https://msgcore.yourdomain.com
```

### Using Docker Compose (Local Development)

For local development with embedded PostgreSQL and Redis:

```bash
# Start all services (includes databases)
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Access at `http://localhost:7890`

### Available Docker Images

- `filipeai/msgcore:latest` - Latest stable release
- `filipeai/msgcore:1.0.4` - Specific version
- `filipeai/msgcore:dev` - Development builds

See [DOCKER.md](DOCKER.md) for detailed Docker documentation.

## Environment Variables

### Required Variables

**Core**
- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:pass@host:5432/msgcore?schema=public`)
- `REDIS_URL` - Redis connection string for Bull queue (e.g., `redis://:password@host:6379`)
- `JWT_SECRET` - Secret for JWT token signing (generate with `openssl rand -hex 32`)
- `ENCRYPTION_KEY` - AES-256-GCM key for credential encryption (generate with `openssl rand -hex 32`)

**AI/LLM Integration**
- `OPENROUTER_API_KEY` - OpenRouter API key for LLM-based entity extraction
- `OPENAI_API_KEY` - OpenAI API key for Whisper voice transcription

**LangSmith (Observability & Tracing)**
- `LANGCHAIN_API_KEY` - LangSmith API key for tracing and monitoring
- `LANGCHAIN_TRACING_V2` - Set to `"true"` to enable LangSmith tracing
- `LANGCHAIN_ENDPOINT` - LangSmith endpoint (default: `https://api.smith.langchain.com`)
- `LANGCHAIN_PROJECT` - Project name for organizing traces in LangSmith

### Optional Variables

**Application**
- `PORT` - HTTP server port (default: `7890`)
- `NODE_ENV` - Environment (`development`, `production`, `test`)
- `MSGCORE_API_URL` - Public URL for webhooks (e.g., `https://msgcore.yourdomain.com`)
- `LOG_LEVEL` - Logging level (`debug`, `info`, `warn`, `error`)

**Monitoring**
- `SENTRY_DSN` - Sentry error tracking DSN for production error monitoring

### Example `.env` File

```bash
# Database
DATABASE_URL=postgresql://msgcore:password@localhost:5432/msgcore?schema=public
REDIS_URL=redis://:password@localhost:6379

# Security (Generate with: openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)

# AI/LLM Integration
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENAI_API_KEY=sk-proj-your-key-here

# LangSmith (Observability & Tracing)
LANGCHAIN_API_KEY=lsv2_pt_your-key-here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_PROJECT=msgcore-production

# Application
PORT=7890
NODE_ENV=production
MSGCORE_API_URL=https://msgcore.yourdomain.com
LOG_LEVEL=info

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Installation

### SDK

```bash
npm install @msgcore/sdk
```

```typescript
import { MsgCore } from '@msgcore/sdk';

const msgcore = new MsgCore({
  apiUrl: 'http://localhost:7890',
  apiKey: 'your-api-key',
});

// Send message
await msgcore.messages.send({
  project: 'project-id',
  targets: [{ platformId: 'discord-bot', type: 'user', id: '123' }],
  content: { text: 'Hello!' },
});

// Get conversation history
const messages = await msgcore.messages.list({ project: 'project-id', limit: 50 });
```

### CLI

```bash
npm install -g @msgcore/cli

msgcore config set apiKey your-key
msgcore projects list
msgcore messages send --target "platform:user:123" --text "Hello"
```

### MCP (Model Context Protocol)

**HTTP Server** (via API):

```json
{
  "mcpServers": {
    "msgcore": {
      "url": "http://localhost:7890/mcp",
      "transport": "http",
      "headers": {
        "X-API-Key": "your-api-key"
      }
    }
  }
}
```

**stdio Server** (via CLI):

```json
{
  "mcpServers": {
    "msgcore": {
      "command": "msgcore",
      "args": ["mcp"]
    }
  }
}
```

Both expose all API endpoints as MCP tools with permission awareness.

## Supported Platforms

| Platform  | Send | Receive | Attachments | Buttons | Reactions |
| --------- | ---- | ------- | ----------- | ------- | --------- |
| Discord   | ✅   | ✅      | ✅          | ✅      | ✅        |
| Telegram  | ✅   | ✅      | ✅          | ✅      | ✅        |
| WhatsApp  | ✅   | ✅      | ✅          | ❌      | ✅        |
| Email     | ✅   | 🔜      | ✅          | ❌      | ❌        |

## Authentication

MsgCore supports three authentication methods:

1. **API Keys** - Programmatic access with scopes
2. **Local JWT** - Email/password authentication
3. **Auth0 JWT** - Enterprise SSO (optional)

## Documentation

- [Architecture Guide](CLAUDE.md) - Technical overview and API reference
- [Testing Guide](test/CLAUDE.md) - Test strategy and patterns
- [WhatsApp Guide](docs/WHATSAPP_EVO.md) - Evolution API integration
- [Contributing](CONTRIBUTING.md) - Development workflow

## Generated Packages

- [@msgcore/sdk](https://github.com/msgcore/msgcore-sdk) - TypeScript client
- [@msgcore/cli](https://github.com/msgcore/msgcore-cli) - Command-line tool
- [n8n-nodes-msgcore](https://github.com/msgcore/n8n-nodes-msgcore) - Visual automation

## License

Apache 2.0 - See [LICENSE](LICENSE)

## Community

Join our Discord: [https://discord.gg/bQPsvycW](https://discord.gg/bQPsvycW)
