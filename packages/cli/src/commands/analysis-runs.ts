// Generated Analysis / Runs commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createAnalysisRunsCommand(): Command {
  const analysisRuns = new Command('analysis-runs');

  analysisRuns
    .command('create')
    .description('Execute an analysis run with a profile')
    .option('--profileId <value>', 'Analysis profile ID')
    .option('--chatIds <value>', 'Filter by chat IDs (JSON array)')
    .option('--identityIds <value>', 'Filter by identity IDs (JSON array)')
    .option('--dateRangeStart <value>', 'Start date for analysis (ISO 8601)')
    .option('--dateRangeEnd <value>', 'End date for analysis (ISO 8601)')
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

        const result = await gk.analysisRuns.create({
      profileId: options.profileId,
      chatIds: options.chatIds ? (typeof options.chatIds === 'string' ? options.chatIds.split(',').map((v: string) => v.trim()) : options.chatIds) : undefined,
      identityIds: options.identityIds ? (typeof options.identityIds === 'string' ? options.identityIds.split(',').map((v: string) => v.trim()) : options.identityIds) : undefined,
      dateRangeStart: options.dateRangeStart,
      dateRangeEnd: options.dateRangeEnd,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisRuns
    .command('stats')
    .description('Get analysis run statistics for a project')
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

        const result = await gk.analysisRuns.stats({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisRuns
    .command('list')
    .description('List analysis runs for a project with sorting')
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

        const result = await gk.analysisRuns.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisRuns
    .command('get')
    .description('Get analysis run status and results')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--runId <value>', 'runId parameter', undefined)
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

        const result = await gk.analysisRuns.get(options.runId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  analysisRuns
    .command('cancel')
    .description('Cancel a running or pending analysis run')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--runId <value>', 'runId parameter', undefined)
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

        const result = await gk.analysisRuns.cancel(options.runId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return analysisRuns;
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
