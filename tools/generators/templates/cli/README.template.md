# @msgcore/cli

Permission-aware CLI for MsgCore - Universal messaging gateway.

> **Auto-generated from backend contracts** - Do not edit manually

## Installation

```bash
npm install -g @msgcore/cli
```

## Quick Start

### Option 1: Using Config File (Recommended for local development)

```bash
# Configure CLI (stores in ~/.msgcore/config.json with secure permissions)
msgcore config set apiUrl https://api.msgcore.dev
msgcore config set apiKey msc_live_your_api_key_here
msgcore config set defaultProject my-project

# Verify configuration
msgcore config list

# Use CLI
msgcore messages send --target "platform-id:user:123" --text "Hello!"
```

### Option 2: Using Environment Variables (Recommended for CI/CD)

```bash
# Set environment variables (override config file)
export MSGCORE_API_URL="https://api.msgcore.dev"
export MSGCORE_API_KEY="msc_live_your_api_key_here"
export MSGCORE_DEFAULT_PROJECT="my-project"

# Use CLI
msgcore projects list --json
```

### Configuration Priority

1. **Environment variables** (highest priority)
2. **Config file** (~/.msgcore/config.json)
3. **Defaults**

This allows you to:

- Use config file for daily work
- Override with env vars for CI/CD or testing
- Keep sensitive keys secure (file has 600 permissions)

## Features

- ✅ **Permission-aware** - Only shows commands you have access to
- ✅ **Auto-generated** - Always synced with backend API
- ✅ **Type-safe** - Built on @msgcore/sdk with full type safety
- ✅ **Interactive** - Helpful prompts and error messages
- ✅ **JSON output** - Perfect for scripting and automation

## Commands

{{COMMAND_LIST}}

## Configuration Management

### Config Commands

```bash
# Set configuration values
msgcore config set apiUrl https://api.msgcore.dev
msgcore config set apiKey msc_live_your_api_key_here
msgcore config set defaultProject my-project
msgcore config set outputFormat json

# Get a specific value
msgcore config get apiKey
# Output: apiKey = ***

# List all configuration
msgcore config list
# Output:
#   apiUrl = https://api.msgcore.dev
#   apiKey = ***
#   defaultProject = my-project
```

### Configuration File

Stored in `~/.msgcore/config.json` with **secure permissions (600)**:

```json
{
  "apiUrl": "https://api.msgcore.dev",
  "apiKey": "msc_live_your_api_key_here",
  "defaultProject": "my-project",
  "outputFormat": "table"
}
```

**Security:**

- File permissions: `600` (owner read/write only)
- Directory permissions: `700`
- API keys are never logged or displayed in full
- Safe to use on shared systems

### Environment Variables (Override Config File)

Environment variables have **highest priority**:

```bash
export MSGCORE_API_URL="https://api.msgcore.dev"
export MSGCORE_API_KEY="msc_live_your_api_key_here"
export MSGCORE_JWT_TOKEN="your-jwt-token"  # Alternative to API key
export MSGCORE_DEFAULT_PROJECT="my-project"
export MSGCORE_OUTPUT_FORMAT="json"        # or "table"
```

**Use cases:**

- CI/CD pipelines (GitHub Actions, GitLab CI)
- Docker containers
- Temporary overrides for testing
- Multiple environments

### Configuration Priority

```
┌─────────────────────────────────┐
│ 1. Environment Variables        │ ← Highest priority
├─────────────────────────────────┤
│ 2. Config File (~/.msgcore/)    │
├─────────────────────────────────┤
│ 3. Defaults                     │ ← Lowest priority
└─────────────────────────────────┘
```

## Scripting

The CLI supports `--json` flag for machine-readable output:

```bash
# Get projects as JSON
msgcore projects list --json | jq '.[] | .id'

# Send message and capture result
RESULT=$(msgcore messages send --target "id:user:123" --text "Hello" --json)
echo $RESULT | jq '.jobId'
```

## Links

- [Documentation](https://docs.msgcore.dev)
- [GitHub](https://github.com/msgcore/msgcore-cli)
- [npm](https://www.npmjs.com/package/@msgcore/cli)
- [Discord Community](https://discord.gg/bQPsvycW)

## License

MIT
