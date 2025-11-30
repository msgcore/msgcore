// Generated Messages commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';
import { buildMessageDto } from '../lib/message-utils';

export function createMessagesCommand(): Command {
  const messages = new Command('messages');

  messages
    .command('list')
    .description('List messages for a project (sent and received)')
    .option('--platformId <value>', 'Filter by platform ID')
    .option('--chatId <value>', 'Filter by chat/channel ID')
    .option('--userId <value>', 'Filter by user ID')
    .option('--direction <value>', 'Filter by message direction')
    .option('--startDate <value>', 'Filter messages after this date (ISO 8601)')
    .option('--endDate <value>', 'Filter messages before this date (ISO 8601)')
    .option('--limit <value>', 'Number of messages to return (1-100)', '50')
    .option('--offset <value>', 'Number of messages to skip', '0')
    .option('--order <value>', 'Sort order (asc or desc)', 'desc')
    .option('--raw <value>', 'Include raw platform message data', 'false')
    .option('--reactions <value>', 'Include reactions on each message', 'false')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.list({
      platformId: options.platformId,
      chatId: options.chatId,
      userId: options.userId,
      direction: options.direction,
      startDate: options.startDate,
      endDate: options.endDate,
      limit: options.limit ? (() => { const val = parseInt(options.limit, 10); if (isNaN(val)) throw new Error(`Invalid number for --limit: "${options.limit}"`); return val; })() : undefined,
      offset: options.offset ? (() => { const val = parseInt(options.offset, 10); if (isNaN(val)) throw new Error(`Invalid number for --offset: "${options.offset}"`); return val; })() : undefined,
      order: options.order,
      raw: options.raw !== undefined ? (options.raw === 'true' || options.raw === true) : undefined,
      reactions: options.reactions !== undefined ? (options.reactions === 'true' || options.reactions === true) : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  messages
    .command('stats')
    .description('Get message statistics for a project')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.stats({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  messages
    .command('get')
    .description('Get a specific message by ID')
    .option('--messageId <value>', 'Message ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.get(options.messageId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  messages
    .command('cleanup')
    .description('Delete messages older than specified days')
    .option('--daysBefore <value>', 'Delete messages older than this many days')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.cleanup({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  messages
    .command('send')
    .description('Send a message to platforms')
    .option('--target <value>', 'Single target in format: platformId:type:id')
    .option('--targets <value>', 'Multiple targets comma-separated: platformId:type:id,platformId:type:id')
    .option('--text <value>', 'Message text content')
    .option('--content <value>', 'Full message content object (advanced)')
    .option('--options <value>', 'Message options')
    .option('--metadata <value>', 'Message metadata')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.send(buildMessageDto(options));

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  messages
    .command('status')
    .description('Check message delivery status')
    .option('--jobId <value>', 'Message job ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.status(options.jobId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  messages
    .command('retry')
    .description('Retry a failed message')
    .option('--jobId <value>', 'Failed message job ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.retry(options.jobId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  messages
    .command('react')
    .description('Add a reaction to a message')
    .option('--platformId <value>', 'Platform configuration ID')
    .option('--messageId <value>', 'Message ID to react to')
    .option('--emoji <value>', 'Emoji to react with (e.g., "👍", "❤️")')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.react({
      platformId: options.platformId,
      messageId: options.messageId,
      emoji: options.emoji,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  messages
    .command('unreact')
    .description('Remove a reaction from a message')
    .option('--platformId <value>', 'Platform configuration ID')
    .option('--messageId <value>', 'Message ID to unreact from')
    .option('--emoji <value>', 'Emoji to remove (e.g., "👍", "❤️")')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--email.cc <value>', '[Email (SMTP)] CC recipients (Carbon Copy) Multiple recipients who will receive a copy of the email')
    .option('--email.bcc <value>', '[Email (SMTP)] BCC recipients (Blind Carbon Copy) Multiple recipients who will receive a copy without others knowing')
    .option('--email.replyTo <value>', '[Email (SMTP)] Reply-To address Email address where replies should be sent (different from sender)')
    .option('--email.headers <value>', '[Email (SMTP)] Custom SMTP headers Advanced: Add custom headers to the email')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["messages:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: messages:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.messages.unreact({
      platformId: options.platformId,
      messageId: options.messageId,
      emoji: options.emoji,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return messages;
}


async function checkPermissions(config: any, requiredScopes: string[]): Promise<boolean> {
  try {
    // We need to add a permissions method to the SDK
    // For now, use axios directly
    const axios = require('axios');
    const client = axios.create({
      baseURL: config.apiUrl,
      headers: config.apiKey ? { 'X-API-Key': config.apiKey } : { 'Authorization': `Bearer ${config.jwtToken}` }
    });

    const response = await client.get('/api/v1/auth/whoami');
    const userPermissions = response.data.permissions || [];

    return requiredScopes.every(scope => userPermissions.includes(scope));
  } catch {
    return false; // Assume no permission if check fails
  }
}
