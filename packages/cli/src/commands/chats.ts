// Generated Chats commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createChatsCommand(): Command {
  const chats = new Command('chats');

  chats
    .command('list')
    .description('List all chats for a project with filtering and pagination')
    .option('--platformId <value>', 'Filter by platform ID')
    .option('--chatType <value>', 'Filter by chat type (individual, group, channel)')
    .option('--search <value>', 'Search chats by name or provider chat ID')
    .option('--limit <value>', 'Number of chats to return', '50')
    .option('--offset <value>', 'Number of chats to skip', '0')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.chats.list({
      platformId: options.platformId,
      chatType: options.chatType,
      search: options.search,
      limit: options.limit ? (() => { const val = parseInt(options.limit, 10); if (isNaN(val)) throw new Error(`Invalid number for --limit: "${options.limit}"`); return val; })() : undefined,
      offset: options.offset ? (() => { const val = parseInt(options.offset, 10); if (isNaN(val)) throw new Error(`Invalid number for --offset: "${options.offset}"`); return val; })() : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  chats
    .command('get')
    .description('Get details of a specific chat')
    .option('--chatId <value>', 'Chat ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.chats.get(options.chatId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  chats
    .command('messages')
    .description('Get messages for a specific chat with pagination')
    .option('--chatId <value>', 'Chat ID')
    .option('--limit <value>', 'Number of messages to return', '50')
    .option('--offset <value>', 'Number of messages to skip', '0')
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
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.chats.messages(options.chatId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  chats
    .command('update')
    .description('Update chat metadata (name, avatar, custom metadata)')
    .option('--chatId <value>', 'Chat ID')
    .option('--name <value>', 'Chat display name')
    .option('--avatarUrl <value>', 'Chat avatar URL')
    .option('--metadata <value>', 'Custom metadata (JSON string)')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.chats.update(options.chatId, {
      name: options.name,
      avatarUrl: options.avatarUrl,
      metadata: options.metadata,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  chats
    .command('sync-all')
    .description('Sync all chats and their messages from all platforms')
    .option('--platformId <value>', 'Optional: Sync only chats from specific platform')
    .option('--startDate <value>', 'Start date for history sync (ISO 8601)')
    .option('--endDate <value>', 'End date for history sync (ISO 8601)')
    .option('--limit <value>', 'Maximum number of messages to sync per chat (1-1000)', '100')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.chats.syncAll({
      platformId: options.platformId,
      startDate: options.startDate,
      endDate: options.endDate,
      limit: options.limit ? (() => { const val = parseInt(options.limit, 10); if (isNaN(val)) throw new Error(`Invalid number for --limit: "${options.limit}"`); return val; })() : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  chats
    .command('sync')
    .description('Sync historical messages for a specific chat from the platform provider')
    .option('--chatId <value>', 'Chat ID')
    .option('--startDate <value>', 'Start date for history sync (ISO 8601)')
    .option('--endDate <value>', 'End date for history sync (ISO 8601)')
    .option('--limit <value>', 'Maximum number of messages to sync (1-1000)', '100')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.chats.sync(options.chatId, {
      startDate: options.startDate,
      endDate: options.endDate,
      limit: options.limit ? (() => { const val = parseInt(options.limit, 10); if (isNaN(val)) throw new Error(`Invalid number for --limit: "${options.limit}"`); return val; })() : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return chats;
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
