// Generated Analysis / Entities commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createAnalysisEntitiesCommand(): Command {
  const analysisEntities = new Command('analysis-entities');

  analysisEntities
    .command('list')
    .description('List all extracted entities for a project with pagination and sorting')
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

        const result = await gk.analysisEntities.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisEntities
    .command('get')
    .description('Get a specific extracted entity by ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--id <value>', 'id parameter', undefined)
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

        const result = await gk.analysisEntities.get(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return analysisEntities;
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
