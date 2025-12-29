# n8n-nodes-msgcore

n8n community node for MsgCore - Universal messaging gateway.

> **Auto-generated from backend contracts** - Do not edit manually

## Installation

### In n8n (Recommended)

Add to your n8n instance's `package.json`:

```json
{
  "dependencies": {
    "n8n-nodes-msgcore": "latest"
  }
}
```

### For Development

```bash
npm install n8n-nodes-msgcore
```

## Features

- ✅ **Visual automation** - Drag-and-drop workflow builder
- ✅ **AI Agent compatible** - Use MsgCore as a tool in AI Agent workflows
- ✅ **Auto-generated** - Always synced with MsgCore API
- ✅ **300k+ n8n users** - Massive automation community
- ✅ **All operations** - Complete API coverage in visual format
- ✅ **Type-safe** - Full TypeScript support

## Available Operations

### Webhooks

- **webhooks create** - Create a new webhook for event notifications
- **webhooks list** - List all webhooks for a project
- **webhooks get** - Get a specific webhook with delivery statistics
- **webhooks update** - Update a webhook configuration
- **webhooks delete** - Delete a webhook
- **webhooks deliveries** - List webhook delivery attempts with filtering

### Projects

- **projects create** - Create a new project
- **projects list** - List all projects
- **projects get** - Get project details
- **projects update** - Update project name, description and settings
- **projects delete** - Delete a project

### Platforms

- **platforms create** - Configure a new platform integration
- **platforms list** - List configured platforms for project
- **platforms get** - Get platform configuration details
- **platforms update** - Update platform configuration
- **platforms delete** - Remove platform configuration
- **platforms register-webhook** - Register webhook URL with platform provider
- **platforms qr-code** - Get QR code for WhatsApp authentication
- **platforms supported** - List supported platforms with credential requirements

### Messages

- **messages list** - List messages for a project (sent and received)
- **messages stats** - Get message statistics for a project
- **messages get** - Get a specific message by ID
- **messages cleanup** - Delete messages older than specified days
- **messages send** - Send a message to platforms
- **messages status** - Check message delivery status
- **messages retry** - Retry a failed message
- **messages react** - Add a reaction to a message
- **messages unreact** - Remove a reaction from a message

### Members

- **members list** - List all members of a project
- **members add** - Add a member to a project
- **members update** - Update a member role in a project
- **members remove** - Remove a member from a project
- **members invite** - Invite a user to join a project

### Identities

- **identities create** - Create a new identity with platform aliases
- **identities list** - List all identities for a project
- **identities search** - Search identities by display name or email
- **identities quick-link** - Create identity and link platform user in one operation
- **identities lookup** - Lookup identity by platform user ID (returns null if not found)
- **identities get** - Get a specific identity by ID
- **identities update** - Update identity metadata (display name, email, metadata)
- **identities add-alias** - Add a platform alias to an existing identity
- **identities remove-alias** - Remove a platform alias from an identity
- **identities delete** - Delete an identity and all its aliases
- **identities messages** - Get all messages for an identity (across all linked platform accounts)
- **identities reactions** - Get all reactions for an identity (across all linked platform accounts)

### Billing

- **billing checkout** - Create Stripe checkout session for subscription upgrade
- **billing portal** - Access Stripe customer portal to manage subscription
- **billing subscription** - Get current subscription details including tier, status, and trial info
- **billing usage** - Get usage statistics for projects, messages, platforms, webhooks with limit warnings
- **billing sync** - Manually sync subscription data from Stripe

### ApiKeys

- **keys create** - Generate a new API key
- **keys list** - List all API keys for project
- **keys revoke** - Revoke an API key
- **keys roll** - Roll an API key (generate new key, revoke old after 24h)

### Auth

- **auth signup** - Create a new user account (first user becomes admin)
- **auth login** - Login with email and password
- **auth accept-invite** - Accept a project invitation and create account
- **auth whoami** - Get current authentication context and permissions
- **auth update-password** - Update your password (requires current password)
- **auth update-profile** - Update your profile information

### Platform Logs

- **platforms logs list** - List platform processing logs for a project
- **platforms logs get** - List logs for a specific platform configuration
- **platforms logs stats** - Get platform logs statistics and recent errors

### Chats

- **chats list** - List all chats for a project with filtering and pagination
- **chats get** - Get details of a specific chat
- **chats messages** - Get messages for a specific chat with pagination
- **chats update** - Update chat metadata (name, avatar, custom metadata)
- **chats sync-all** - Sync all chats and their messages from all platforms
- **chats sync** - Sync historical messages for a specific chat from the platform provider

### Analysis / Models

- **analysis models list** - List available LLM models from OpenRouter for analysis

### Analysis / Entities

- **analysis entities list** - List all extracted entities for a project with pagination and sorting
- **analysis entities get** - Get a specific extracted entity by ID

### Analysis / Schemas

- **analysis schemas create** - Create a new entity schema for custom extraction
- **analysis schemas list** - List all entity schemas for a project
- **analysis schemas get** - Get a specific entity schema
- **analysis schemas update** - Update an entity schema
- **analysis schemas delete** - Delete an entity schema (soft delete)

### Analysis / Runs

- **analysis runs create** - Execute an analysis run with a profile
- **analysis runs stats** - Get analysis run statistics for a project
- **analysis runs list** - List analysis runs for a project with sorting
- **analysis runs get** - Get analysis run status and results
- **analysis runs cancel** - Cancel a running or pending analysis run

### Analysis / Profiles

- **analysis profiles create** - Create a new analysis profile (versioned pipeline)
- **analysis profiles list** - List all analysis profiles for a project
- **analysis profiles get** - Get a specific analysis profile
- **analysis profiles update** - Update an analysis profile
- **analysis profiles delete** - Delete an analysis profile (soft delete)

## Configuration

### Credentials

The node requires MsgCore API credentials:

1. **API URL**: Your MsgCore API endpoint (e.g., `https://api.msgcore.dev`)
2. **API Key**: Your MsgCore API key (starts with `msc_`)

### Setting up Credentials in n8n

1. Go to **Credentials** in n8n
2. Click **New Credential**
3. Search for "MsgCore"
4. Fill in:
   - **API URL**: `https://api.msgcore.dev`
   - **API Key**: Your API key from MsgCore dashboard

## Usage Examples

### Send Message Workflow

1. Add **MsgCore** node
2. Select **Messages** resource
3. Select **Send** operation
4. Configure:
   - **Project ID**: Your project identifier
   - **Targets**: Platform users to message
   - **Content**: Message text and attachments

### Platform Management

1. Add **MsgCore** node
2. Select **Platforms** resource
3. Choose operation (Create, List, Update, Delete)
4. Configure platform-specific credentials

## AI Agent Integration

MsgCore is fully compatible with n8n's AI Agent workflows. Enable your AI agents to:

- **Send messages** - AI can send messages across any platform
- **Manage platforms** - Configure and manage platform integrations
- **Query messages** - Search and analyze message history
- **Automate workflows** - Combine AI reasoning with messaging actions

### Using MsgCore as an AI Agent Tool

1. Add an **AI Agent** node (Tools Agent or Conversational Agent)
2. Connect **MsgCore** node as a tool
3. The AI will automatically understand available operations
4. Set `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` for community packages

Example use cases:

- "Send a Discord message to the team channel about deployment status"
- "Configure WhatsApp integration for project X"
- "Check if there are any failed messages and retry them"

## Why n8n + MsgCore?

- **No-code automation** - Build workflows without programming
- **AI-powered** - Let AI agents handle messaging logic automatically
- **Multi-platform messaging** - Discord, Telegram, WhatsApp in one node
- **Event-driven** - Trigger messages from any n8n event
- **Scale easily** - Handle thousands of messages with queues

## Links

- [n8n Community Nodes](https://www.npmjs.com/package/n8n-nodes-msgcore)
- [MsgCore Documentation](https://docs.msgcore.dev)
- [GitHub](https://github.com/msgcore/n8n-nodes-msgcore)
- [Discord Community](https://discord.gg/bQPsvycW)

## License

MIT
