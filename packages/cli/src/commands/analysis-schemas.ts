// Generated Analysis / Schemas commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createAnalysisSchemasCommand(): Command {
  const analysisSchemas = new Command('analysis-schemas');

  analysisSchemas
    .command('create')
    .description('Create a new entity schema for custom extraction')
    .option('--project <value>', 'Project ID')
    .option('--name <value>', 'Schema name')
    .option('--extractionType <value>', 'Extraction type (llm_extraction, rule_based, api_logged)')
    .option('--properties <value>', 'JSON schema for entity properties')
    .option('--prompt <value>', 'LLM prompt (for llm_extraction)')
    .option('--description <value>', 'Schema description')
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

        const result = await gk.analysisSchemas.create({
      name: options.name,
      extractionType: options.extractionType,
      properties: options.properties,
      prompt: options.prompt,
      description: options.description,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisSchemas
    .command('list')
    .description('List all entity schemas for a project')
    .option('--project <value>', 'Project ID')
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

        const result = await gk.analysisSchemas.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisSchemas
    .command('get')
    .description('Get a specific entity schema')
    .option('--project <value>', 'Project ID')
    .option('--schemaId <value>', 'Schema ID')
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

        const result = await gk.analysisSchemas.get(options.schemaId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisSchemas
    .command('update')
    .description('Update an entity schema')
    .option('--project <value>', 'Project ID')
    .option('--schemaId <value>', 'Schema ID')
    .option('--name <value>', 'New schema name')
    .option('--prompt <value>', 'New LLM prompt')
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

        const result = await gk.analysisSchemas.update(options.schemaId, {
      name: options.name,
      prompt: options.prompt,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisSchemas
    .command('delete')
    .description('Delete an entity schema (soft delete)')
    .option('--project <value>', 'Project ID')
    .option('--schemaId <value>', 'Schema ID')
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

        const result = await gk.analysisSchemas.delete(options.schemaId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return analysisSchemas;
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
