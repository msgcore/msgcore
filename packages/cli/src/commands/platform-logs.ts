// Generated Platform Logs commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createPlatformLogsCommand(): Command {
  const platformLogs = new Command('platform-logs');

  platformLogs
    .command('list')
    .description('List platform processing logs for a project')
    .option('--platform <value>', 'Filter by platform (telegram, discord)')
    .option('--level <value>', 'Filter by log level')
    .option('--category <value>', 'Filter by log category')
    .option('--startDate <value>', 'Filter logs after this date (ISO 8601)')
    .option('--endDate <value>', 'Filter logs before this date (ISO 8601)')
    .option('--limit <value>', 'Number of logs to return (1-1000)', '100')
    .option('--offset <value>', 'Number of logs to skip')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["platforms:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: platforms:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.platformLogs.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platformLogs
    .command('get')
    .description('List logs for a specific platform configuration')
    .option('--level <value>', 'Filter by log level')
    .option('--category <value>', 'Filter by log category')
    .option('--startDate <value>', 'Filter logs after this date (ISO 8601)')
    .option('--endDate <value>', 'Filter logs before this date (ISO 8601)')
    .option('--limit <value>', 'Number of logs to return (1-1000)', '100')
    .option('--offset <value>', 'Number of logs to skip')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--platformId <value>', 'platformId parameter', undefined)
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["platforms:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: platforms:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.platformLogs.get(options.platformId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platformLogs
    .command('stats')
    .description('Get platform logs statistics and recent errors')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["platforms:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: platforms:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.platformLogs.stats({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return platformLogs;
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
