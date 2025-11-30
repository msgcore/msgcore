// Generated Members commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createMembersCommand(): Command {
  const members = new Command('members');

  members
    .command('list')
    .description('List all members of a project')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["members:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: members:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.members.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  members
    .command('add')
    .description('Add a member to a project')
    .option('--email <value>', 'Email of user to add')
    .option('--role <value>', 'Role to assign to the member')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["members:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: members:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.members.add({
      email: options.email,
      role: options.role,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  members
    .command('update')
    .description('Update a member role in a project')
    .option('--userId <value>', 'User ID of the member to update')
    .option('--role <value>', 'New role to assign')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["members:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: members:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.members.update(options.userId, {
      role: options.role,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  members
    .command('remove')
    .description('Remove a member from a project')
    .option('--userId <value>', 'User ID of the member to remove')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["members:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: members:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.members.remove(options.userId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  members
    .command('invite')
    .description('Invite a user to join a project')
    .option('--email <value>', 'Email address of user to invite')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["members:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: members:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.members.invite({
      email: options.email,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return members;
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
