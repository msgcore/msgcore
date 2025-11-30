// Generated Projects commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createProjectsCommand(): Command {
  const projects = new Command('projects');

  projects
    .command('create')
    .description('Create a new project')
    .option('--name <value>', 'Project name')
    .option('--description <value>', 'Project description')
    .option('--environment <value>', 'Project environment', 'development')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["projects:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: projects:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.projects.create({
      name: options.name,
      description: options.description,
      environment: options.environment
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  projects
    .command('list')
    .description('List all projects')

    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["projects:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: projects:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.projects.list();

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  projects
    .command('get')
    .description('Get project details')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["projects:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: projects:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.projects.get({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  projects
    .command('update')
    .description('Update project name, description and settings')
    .option('--name <value>', 'Project name')
    .option('--description <value>', 'Project description')
    .option('--environment <value>', 'Project environment')
    .option('--isDefault <value>', 'Set as default project')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["projects:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: projects:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.projects.update({
      name: options.name,
      description: options.description,
      environment: options.environment,
      isDefault: options.isDefault !== undefined ? (options.isDefault === 'true' || options.isDefault === true) : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  projects
    .command('delete')
    .description('Delete a project')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["projects:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: projects:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.projects.delete({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return projects;
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
