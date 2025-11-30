// Generated Identities commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createIdentitiesCommand(): Command {
  const identities = new Command('identities');

  identities
    .command('create')
    .description('Create a new identity with platform aliases')
    .option('--displayName <value>', 'Display name for the identity')
    .option('--email <value>', 'Email address for the identity')
    .option('--metadata <value>', 'JSON metadata for the identity')
    .option('--aliases <value>', 'JSON array of platform aliases')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.create({
      displayName: options.displayName,
      email: options.email,
      metadata: options.metadata,
      aliases: options.aliases,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('list')
    .description('List all identities for a project')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.list({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('search')
    .description('Search identities by display name or email')
    .option('--q <value>', 'Search query (min 2 characters)')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.search({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('quick-link')
    .description('Create identity and link platform user in one operation')
    .option('--platformId <value>', 'Platform configuration ID')
    .option('--providerUserId <value>', 'Provider-specific user ID')
    .option('--providerUserDisplay <value>', 'Display name on the platform')
    .option('--displayName <value>', 'Display name for the new identity')
    .option('--email <value>', 'Email address for the new identity')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.quickLink({
      platformId: options.platformId,
      providerUserId: options.providerUserId,
      providerUserDisplay: options.providerUserDisplay,
      displayName: options.displayName,
      email: options.email,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('lookup')
    .description('Lookup identity by platform user ID (returns null if not found)')
    .option('--platformId <value>', 'Platform configuration ID')
    .option('--providerUserId <value>', 'Provider-specific user ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.lookup({ project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('get')
    .description('Get a specific identity by ID')
    .option('--id <value>', 'Identity ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.get(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('update')
    .description('Update identity metadata (display name, email, metadata)')
    .option('--id <value>', 'Identity ID')
    .option('--displayName <value>', 'Updated display name')
    .option('--email <value>', 'Updated email address')
    .option('--metadata <value>', 'Updated JSON metadata')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.update(options.id, {
      displayName: options.displayName,
      email: options.email,
      metadata: options.metadata,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('add-alias')
    .description('Add a platform alias to an existing identity')
    .option('--id <value>', 'Identity ID')
    .option('--platformId <value>', 'Platform configuration ID')
    .option('--providerUserId <value>', 'Provider-specific user ID')
    .option('--providerUserDisplay <value>', 'Display name on the platform')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.addAlias(options.id, {
      platformId: options.platformId,
      providerUserId: options.providerUserId,
      providerUserDisplay: options.providerUserDisplay,
      project: options.project || config.defaultProject
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('remove-alias')
    .description('Remove a platform alias from an identity')
    .option('--id <value>', 'Identity ID')
    .option('--aliasId <value>', 'Alias ID to remove')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.removeAlias(options.id, options.aliasId, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('delete')
    .description('Delete an identity and all its aliases')
    .option('--id <value>', 'Identity ID to delete')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:write"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:write');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.delete(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('messages')
    .description('Get all messages for an identity (across all linked platform accounts)')
    .option('--id <value>', 'Identity ID')
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
        const hasPermission = await checkPermissions(config, ["identities:read","messages:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:read, messages:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.messages(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  identities
    .command('reactions')
    .description('Get all reactions for an identity (across all linked platform accounts)')
    .option('--id <value>', 'Identity ID')
    .option('--project <value>', 'Project (uses MSGCORE_DEFAULT_PROJECT if not provided)')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        const hasPermission = await checkPermissions(config, ["identities:read","messages:read"]);
        if (!hasPermission) {
          console.error('❌ Insufficient permissions. Required: identities:read, messages:read');
          process.exit(1);
        }

        const gk = new MsgCore(config);

        const result = await gk.identities.reactions(options.id, { project: options.project || config.defaultProject });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return identities;
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
