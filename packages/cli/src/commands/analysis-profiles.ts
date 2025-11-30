// Generated Analysis / Profiles commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createAnalysisProfilesCommand(): Command {
  const analysisProfiles = new Command('analysis-profiles');

  analysisProfiles
    .command('create')
    .description('Create a new analysis profile (versioned pipeline)')
    .option('--name <value>', 'Profile name')
    .option('--description <value>', 'Profile description')
    .option('--graphDefinition <value>', 'Analysis graph definition (JSON)')
    .option('--entitySchemaIds <value>', 'Entity schema IDs (JSON array)')
    .option('--storeEntities <value>', 'Store extracted entities')
    .option('--generateTags <value>', 'Generate tags from analysis')
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

        const result = await gk.analysisProfiles.create({
      name: options.name,
      description: options.description,
      graphDefinition: options.graphDefinition ? (() => { try { return JSON.parse(options.graphDefinition); } catch (e) { throw new Error(`Invalid JSON for --graphDefinition: ${e instanceof Error ? e.message : String(e)}`); } })() : undefined,
      entitySchemaIds: options.entitySchemaIds ? (typeof options.entitySchemaIds === 'string' ? options.entitySchemaIds.split(',').map((v: string) => v.trim()) : options.entitySchemaIds) : undefined,
      storeEntities: options.storeEntities !== undefined ? (options.storeEntities === 'true' || options.storeEntities === true) : undefined,
      generateTags: options.generateTags !== undefined ? (options.generateTags === 'true' || options.generateTags === true) : undefined,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisProfiles
    .command('list')
    .description('List all analysis profiles for a project')
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

        const result = await gk.analysisProfiles.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisProfiles
    .command('get')
    .description('Get a specific analysis profile')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--profileId <value>', 'profileId parameter', undefined)
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

        const result = await gk.analysisProfiles.get(options.profileId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisProfiles
    .command('update')
    .description('Update an analysis profile')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--profileId <value>', 'profileId parameter', undefined)
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

        const result = await gk.analysisProfiles.update(options.profileId, {});

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisProfiles
    .command('delete')
    .description('Delete an analysis profile (soft delete)')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--profileId <value>', 'profileId parameter', undefined)
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

        const result = await gk.analysisProfiles.delete(options.profileId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return analysisProfiles;
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
