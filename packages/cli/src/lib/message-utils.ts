// Message parsing utilities for MsgCore CLI
// Auto-generated - DO NOT EDIT

// Platform options schema (for array detection and object types)
interface PropertySchema {
  type: string;
  description?: string;
  format?: string;
  items?: { type: string; format?: string };
}

const PLATFORM_SCHEMAS: Record<string, Record<string, PropertySchema>> = {
  "email": {
    "cc": {
      "type": "array",
      "description": "CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email",
      "items": {
        "type": "string",
        "format": "email"
      }
    },
    "bcc": {
      "type": "array",
      "description": "BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing",
      "items": {
        "type": "string",
        "format": "email"
      }
    },
    "replyTo": {
      "type": "string",
      "description": "Reply-To address Email address where replies should be sent (different from sender)",
      "format": "email"
    },
    "headers": {
      "type": "object",
      "description": "Custom SMTP headers Advanced: Add custom headers to the email"
    }
  }
};

// Target pattern parsing helpers
export interface TargetPattern {
  platformId: string;
  type: string;
  id: string;
}

export function parseTargetPattern(pattern: string): TargetPattern {
  const parts = pattern.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid target pattern. Expected format: platformId:type:id');
  }

  const [platformId, type, id] = parts;

  if (!['user', 'channel', 'group'].includes(type)) {
    throw new Error('Invalid target type. Must be: user, channel, or group');
  }

  return { platformId, type, id };
}

export function parseTargetsPattern(pattern: string): TargetPattern[] {
  const patterns = pattern.split(',').map(p => p.trim());
  return patterns.map(parseTargetPattern);
}

interface MessageOptions {
  targets?: string;
  target?: string;
  text?: string;
  content?: string;
  options?: string;
  metadata?: string;
  [key: string]: unknown; // For platform-specific options
}

interface MessageDto {
  targets?: TargetPattern[];
  content?: Record<string, unknown>;
  options?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function buildMessageDto(options: MessageOptions): any {
  const dto: MessageDto = {};

  // Handle targets - priority: targets pattern > target pattern > content object
  if (options.targets) {
    dto.targets = parseTargetsPattern(options.targets);
  } else if (options.target) {
    dto.targets = [parseTargetPattern(options.target)];
  }

  // Handle content - priority: text shortcut > content object
  if (options.text) {
    dto.content = { text: options.text };
  } else if (options.content) {
    try {
      dto.content = JSON.parse(options.content);
    } catch (e) {
      throw new Error(`Invalid JSON for --content: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Parse platform-specific options from dotted flags (e.g., --email.cc)
  const platformOptions = parsePlatformOptions(options);
  if (platformOptions) {
    dto.content = dto.content || {};
    dto.content.platformOptions = platformOptions;
  }

  // Handle optional fields with error handling
  if (options.options) {
    try {
      dto.options = JSON.parse(options.options);
    } catch (e) {
      throw new Error(`Invalid JSON for --options: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  if (options.metadata) {
    try {
      dto.metadata = JSON.parse(options.metadata);
    } catch (e) {
      throw new Error(`Invalid JSON for --metadata: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return dto;
}

function parsePlatformOptions(options: MessageOptions): Record<string, Record<string, unknown>> | undefined {
  const platformOptions: Record<string, Record<string, unknown>> = {};

  // Find all dotted options (e.g., email.cc, email.bcc)
  for (const [key, value] of Object.entries(options)) {
    if (typeof key === 'string' && key.includes('.')) {
      const [platform, prop] = key.split('.');

      if (!platformOptions[platform]) {
        platformOptions[platform] = {};
      }

      // Get schema for this property to determine type
      const propSchema = PLATFORM_SCHEMAS[platform]?.[prop];

      if (propSchema?.type === 'object') {
        // Handle object types (like headers: Record<string, string>)
        try {
          platformOptions[platform][prop] = JSON.parse(value as string);
        } catch (e) {
          throw new Error(`Invalid JSON for --${platform}.${prop}: ${e instanceof Error ? e.message : String(e)}`);
        }
      } else if (propSchema?.type === 'array') {
        // Handle array types (split on comma)
        if (typeof value === 'string' && value.includes(',')) {
          platformOptions[platform][prop] = value.split(',').map((v: string) => v.trim());
        } else {
          // Single value becomes single-element array
          platformOptions[platform][prop] = [value];
        }
      } else {
        // Handle scalar types (string, number, boolean)
        platformOptions[platform][prop] = value;
      }
    }
  }

  return Object.keys(platformOptions).length > 0 ? platformOptions : undefined;
}
