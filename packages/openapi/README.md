# MsgCore API Documentation

OpenAPI specification for MsgCore universal messaging gateway.

## Overview

Universal messaging gateway API - send messages across multiple platforms

## Quick Start

### Authentication

MsgCore supports two authentication methods:

1. **API Key** (Recommended)
   ```
   X-API-Key: your-api-key
   ```

2. **JWT Token**
   ```
   Authorization: Bearer your-jwt-token
   ```

### Example Request

```bash
curl -X GET "https://api.msgcore.dev/api/v1/projects" \
  -H "X-API-Key: your-api-key"
```

## Documentation Tools

- **Swagger UI**: Import `openapi.json` for interactive documentation
- **Postman**: Import for API testing and collection management
- **Insomnia**: Load specification for API client testing
- **API Documentation**: Generate docs with any OpenAPI-compatible tool

## Endpoints

64 endpoints across 16 categories.

## Generated Assets

- `openapi.json` - OpenAPI 3.0.3 specification
- `openapi.yaml` - YAML format for documentation tools
- `README.md` - This documentation file

---

**MsgCore** - Universal messaging gateway for modern applications.
