// Generated ApiKeys commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createApikeysCommand(): Command {
  const apikeys = new Command('api-keys');

  apikeys
    .command('create')
    .description('Generate a new API key')
    .option('--name <value>', 'API key name')
    .option('--scopes <value>', 'Array of scope strings (e.g., ["messages:read", "messages:write"])')
    .option('--expiresInDays <value>', 'Expiration in days')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["keys:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: keys:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.apikeys.create({
      name: options.name,
      scopes: options.scopes ? (typeof options.scopes === 'string' ? options.scopes.split(',').map((v: string) => v.trim()) : options.scopes) : undefined,
      expiresInDays: options.expiresInDays ? (() => { const val = parseInt(options.expiresInDays, 10); if (isNaN(val)) throw new Error(`Invalid number for --expiresInDays: "${options.expiresInDays}"`); return val; })() : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  apikeys
    .command('list')
    .description('List all API keys for project')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["keys:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: keys:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.apikeys.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  apikeys
    .command('revoke')
    .description('Revoke an API key')
    .option('--keyId <value>', 'API key ID to revoke')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["keys:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: keys:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.apikeys.revoke(options.keyId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  apikeys
    .command('roll')
    .description('Roll an API key (generate new key, revoke old after 24h)')
    .option('--keyId <value>', 'API key ID to roll')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["keys:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: keys:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.apikeys.roll(options.keyId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return apikeys;
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
