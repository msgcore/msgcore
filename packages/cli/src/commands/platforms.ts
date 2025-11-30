// Generated Platforms commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createPlatformsCommand(): Command {
  const platforms = new Command('platforms');

  platforms
    .command('create')
    .description('Configure a new platform integration')
    .option('--platform <value>', 'Platform type')
    .option('--name <value>', 'Friendly name for the platform instance')
    .option('--description <value>', 'Optional description for the platform instance')
    .option('--credentials <value>', 'Platform credentials (JSON object). Use "msgcore platforms supported" to see required fields for each platform.')
    .option('--isActive <value>', 'Enable platform', 'true')
    .option('--testMode <value>', 'Enable test mode', 'false')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["platforms:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: platforms:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.platforms.create({
      platform: options.platform,
      name: options.name,
      description: options.description,
      credentials: options.credentials ? (() => { try { return JSON.parse(options.credentials); } catch (e) { throw new Error(`Invalid JSON for --credentials: ${e instanceof Error ? e.message : String(e)}`); } })() : undefined,
      isActive: options.isActive !== undefined ? (options.isActive === 'true' || options.isActive === true) : undefined,
      testMode: options.testMode !== undefined ? (options.testMode === 'true' || options.testMode === true) : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platforms
    .command('list')
    .description('List configured platforms for project')
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

        const result = await gk.platforms.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platforms
    .command('get')
    .description('Get platform configuration details')
    .option('--id <value>', 'Platform ID')
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

        const result = await gk.platforms.get(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platforms
    .command('update')
    .description('Update platform configuration')
    .option('--name <value>', 'Updated friendly name')
    .option('--description <value>', 'Updated description')
    .option('--credentials <value>', 'Updated credentials (JSON object)')
    .option('--isActive <value>', 'Enable/disable platform')
    .option('--testMode <value>', 'Enable/disable test mode')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--id <value>', 'id parameter', undefined)
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["platforms:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: platforms:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.platforms.update(options.id, {
      name: options.name,
      description: options.description,
      credentials: options.credentials ? (() => { try { return JSON.parse(options.credentials); } catch (e) { throw new Error(`Invalid JSON for --credentials: ${e instanceof Error ? e.message : String(e)}`); } })() : undefined,
      isActive: options.isActive !== undefined ? (options.isActive === 'true' || options.isActive === true) : undefined,
      testMode: options.testMode !== undefined ? (options.testMode === 'true' || options.testMode === true) : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platforms
    .command('delete')
    .description('Remove platform configuration')
    .option('--id <value>', 'Platform ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["platforms:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: platforms:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.platforms.delete(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platforms
    .command('register-webhook')
    .description('Register webhook URL with platform provider')
    .option('--id <value>', 'Platform ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["platforms:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: platforms:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.platforms.registerWebhook(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platforms
    .command('qr-code')
    .description('Get QR code for WhatsApp authentication')
    .option('--id <value>', 'WhatsApp Platform ID')
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

        const result = await gk.platforms.qrCode(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  platforms
    .command('supported')
    .description('List supported platforms with credential requirements')

    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.platforms.supported();

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return platforms;
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
