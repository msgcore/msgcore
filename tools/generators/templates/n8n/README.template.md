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

{{OPERATIONS_LIST}}

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
