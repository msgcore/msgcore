# MsgCore MCP Integration

## Overview

MsgCore now includes a **Model Context Protocol (MCP)** server that dynamically exposes all API endpoints as MCP tools. This integration leverages the existing contract system to automatically generate MCP tool definitions from `@SdkContract` decorators.

**Two Ways to Use MCP:**

1. **HTTP Transport** - Direct HTTP/SSE connection to backend `/mcp` endpoint
2. **CLI Stdio** - Run `msgcore mcp` command for stdio-based MCP (recommended for Claude Desktop)

## Architecture

### Dynamic Tool Registration

The MCP integration uses MsgCore's contract-driven architecture to automatically convert API endpoints into MCP tools:

```
@SdkContract Decorators (Controllers)
           ↓
    Contract Extractor
           ↓
    MCP Tool Registry
           ↓
    MCP Tools (JSON-RPC)
```

### Key Components

1. **MCP Controller** (`src/mcp/mcp.controller.ts`)
   - Implements MCP HTTP Streamable transport (2025-03-26 spec)
   - Handles JSON-RPC requests: `initialize`, `tools/list`, `tools/call`
   - Supports both POST (client→server) and GET (SSE streaming)
   - Session management with UUID tokens

2. **MCP Tool Registry** (`src/mcp/services/mcp-tool-registry.service.ts`)
   - Converts SDK contracts to MCP tool definitions
   - Maps contract options to JSON Schema
   - Tool naming: `msgcore_{command}` (e.g., `msgcore_projects_create`)

3. **MCP Executor** (`src/mcp/services/mcp-executor.service.ts`)
   - Executes tools by calling internal API endpoints
   - Handles authentication (JWT/API keys)
   - Formats responses as MCP tool results

## MCP Endpoint

**Base URL:** `http://localhost:7890/mcp`

### Supported Methods

#### POST /mcp

- Send JSON-RPC requests (initialize, tools/list, tools/call)
- Required header: `Accept: application/json, text/event-stream`
- Optional header: `Mcp-Session-Id: {session-uuid}`

#### GET /mcp

- Server-Sent Events (SSE) stream for server→client messages
- Required header: `Mcp-Session-Id: {session-uuid}`

## Authentication

MCP endpoints support MsgCore's standard authentication:

1. **JWT Authentication**
   - Header: `Authorization: Bearer {token}`
   - Login via `/api/v1/auth/login`

2. **API Key Authentication**
   - Header: `X-API-Key: {api-key}`
   - Generate via `/api/v1/projects/:project/keys`

## MCP Protocol Flow

### 1. Initialize Session

```json
POST /mcp
Authorization: Bearer {jwt-token}
Accept: application/json, text/event-stream

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2025-03-26",
    "capabilities": {},
    "clientInfo": {
      "name": "claude-desktop",
      "version": "1.0.0"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2025-03-26",
    "capabilities": {
      "tools": {
        "listChanged": true
      }
    },
    "serverInfo": {
      "name": "msgcore-mcp",
      "version": "1.0.0"
    }
  }
}

Headers:
Mcp-Session-Id: {uuid}
```

### 2. List Available Tools

```json
POST /mcp
Mcp-Session-Id: {uuid}

{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "msgcore_projects_create",
        "description": "Create a new project",
        "inputSchema": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "Project name"
            },
            "description": {
              "type": "string",
              "description": "Project description"
            }
          },
          "required": ["name"]
        }
      }
      // ... all other API endpoints as tools
    ]
  }
}
```

### 3. Call a Tool

```json
POST /mcp
Mcp-Session-Id: {uuid}

{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "msgcore_projects_create",
    "arguments": {
      "name": "My New Project",
      "description": "A test project"
    }
  }
}
```

**Response:**

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"id\":\"proj_123\",\"name\":\"My New Project\",...}"
      }
    ],
    "isError": false
  }
}
```

## MCP Client Configuration

Example configuration (format may vary by MCP client):

```json
{
  "mcpServers": {
    "msgcore": {
      "url": "http://localhost:7890/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer YOUR_JWT_TOKEN"
      }
    }
  }
}
```

Or with API key:

```json
{
  "mcpServers": {
    "msgcore": {
      "url": "http://localhost:7890/mcp",
      "transport": "http",
      "headers": {
        "X-API-Key": "YOUR_API_KEY"
      }
    }
  }
}
```

## Available Tools

All MsgCore API endpoints are automatically exposed as MCP tools:

- **Projects**: `msgcore_projects_create`, `msgcore_projects_list`, `msgcore_projects_get`, etc.
- **API Keys**: `msgcore_keys_create`, `msgcore_keys_list`, `msgcore_keys_revoke`, etc.
- **Platforms**: `msgcore_platforms_configure`, `msgcore_platforms_list`, etc.
- **Messages**: `msgcore_messages_send`, `msgcore_messages_list`, `msgcore_messages_status`, etc.
- **Webhooks**: `msgcore_webhooks_create`, `msgcore_webhooks_list`, etc.
- **Members**: `msgcore_members_invite`, `msgcore_members_list`, etc.

## Benefits

1. **Zero Maintenance** - Tools auto-update when API contracts change
2. **Type Safety** - JSON Schema generated from contract options
3. **Full Coverage** - All 53+ API endpoints available as tools
4. **Authentication** - Inherits MsgCore's security model
5. **Session Management** - Stateful connections with UUID sessions

## Implementation Details

### Contract to Tool Mapping

```typescript
// Controller with @SdkContract
@SdkContract({
  command: 'projects create',
  description: 'Create a new project',
  options: {
    name: { required: true, type: 'string' },
    description: { type: 'string' }
  }
})
create(@Body() dto: CreateProjectDto) { ... }

// Becomes MCP Tool
{
  name: "msgcore_projects_create",
  description: "Create a new project",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" }
    },
    required: ["name"]
  }
}
```

### Tool Execution Flow

1. MCP client calls `tools/call` with tool name and arguments
2. Executor service looks up contract metadata (HTTP method, path)
3. Builds internal API request with proper authentication headers
4. Makes HTTP request to `localhost:7890/{path}`
5. Formats API response as MCP tool result

### Security

- All MCP requests require authentication (JWT or API key)
- Session IDs are UUIDs, not predictable
- Project-scoped API keys only access their projects
- No exposure of internal system details

## CLI Stdio Transport (Recommended)

The MsgCore CLI includes an MCP stdio server for seamless integration with Claude Desktop and other MCP clients.

### Installation

```bash
# Install CLI globally
npm install -g @msgcore/cli

# Or use locally
cd generated/cli
npm install
npm run build
npm link
```

### Configuration

```bash
# Set API URL and key
msgcore config set apiUrl http://localhost:7890
msgcore config set apiKey msc_dev_your_api_key_here
```

### Usage

```bash
# Start MCP stdio server
msgcore mcp

# The server communicates via stdin/stdout using JSON-RPC
# Perfect for Claude Desktop integration
```

### Claude Desktop Integration

Add to `claude_desktop_config.json`:

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

**Configuration location:**

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### How It Works

1. Claude Desktop launches `msgcore mcp` as a subprocess
2. CLI creates authenticated HTTP client using stored config
3. All MCP requests are forwarded to backend `/mcp` endpoint
4. Responses are sent back via stdout
5. Simple, clean stdio-based JSON-RPC communication

### Benefits

- ✅ **No HTTP server needed** - CLI handles communication
- ✅ **Uses existing auth** - Configured API key from CLI config
- ✅ **Simple setup** - Just add command to Claude Desktop config
- ✅ **All 51 tools available** - Full API access through MCP
- ✅ **Works offline** - When backend is running locally

## Future Enhancements

- **Resources**: Expose projects/platforms as MCP resources
- **Prompts**: Pre-built prompts for common workflows
- **Streaming**: Real-time message updates via SSE
- **Sampling**: LLM integration for AI-powered responses
