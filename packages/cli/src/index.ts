#!/usr/bin/env node
// Generated CLI entry point for MsgCore
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { saveConfig, getConfigValue, listConfig } from './lib/utils';
import { createAnalysisEntitiesCommand } from './commands/analysis-entities';
import { createAnalysisModelsCommand } from './commands/analysis-models';
import { createAnalysisProfilesCommand } from './commands/analysis-profiles';
import { createAnalysisRunsCommand } from './commands/analysis-runs';
import { createAnalysisSchemasCommand } from './commands/analysis-schemas';
import { createApikeysCommand } from './commands/api-keys';
import { createAuthCommand } from './commands/auth';
import { createBillingCommand } from './commands/billing';
import { createChatsCommand } from './commands/chats';
import { createIdentitiesCommand } from './commands/identities';
import { createMembersCommand } from './commands/members';
import { createMessagesCommand } from './commands/messages';
import { createPlatformLogsCommand } from './commands/platform-logs';
import { createPlatformsCommand } from './commands/platforms';
import { createProjectsCommand } from './commands/projects';
import { createWebhooksCommand } from './commands/webhooks';
import { createMcpCommand } from './commands/mcp';

const program = new Command();

program
  .name('msgcore')
  .description('MsgCore Universal Messaging Gateway CLI')
  .version('1.1.0');

// Config command
const config = new Command('config');
config.description('Manage CLI configuration');

config
  .command('set')
  .description('Set a configuration value')
  .argument('<key>', 'Configuration key (apiUrl, apiKey, defaultProject, outputFormat)')
  .argument('<value>', 'Configuration value')
  .action(async (key: string, value: string) => {
    try {
      const validKeys = ['apiUrl', 'apiKey', 'defaultProject', 'outputFormat'];
      if (!validKeys.includes(key)) {
        console.error(`❌ Invalid key. Valid keys: ${validKeys.join(', ')}`);
        process.exit(1);
      }

      await saveConfig(key, value);
      console.log(`✅ Set ${key} = ${key === 'apiKey' ? '***' : value}`);
    } catch (error) {
      console.error(`❌ Failed to save config: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

config
  .command('get')
  .description('Get a configuration value')
  .argument('<key>', 'Configuration key')
  .action(async (key: string) => {
    try {
      const value = await getConfigValue(key);
      if (value === undefined) {
        console.log(`${key} is not set`);
      } else {
        console.log(`${key} = ${key === 'apiKey' ? '***' : value}`);
      }
    } catch (error) {
      console.error(`❌ Failed to get config: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

config
  .command('list')
  .description('List all configuration values')
  .action(async () => {
    try {
      const config = await listConfig();
      if (Object.keys(config).length === 0) {
        console.log('No configuration set');
      } else {
        console.log('Current configuration:');
        for (const [key, value] of Object.entries(config)) {
          console.log(`  ${key} = ${key === 'apiKey' ? '***' : value}`);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to list config: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  });

program.addCommand(config);

// Add permission-aware commands
  program.addCommand(createAnalysisEntitiesCommand());
  program.addCommand(createAnalysisModelsCommand());
  program.addCommand(createAnalysisProfilesCommand());
  program.addCommand(createAnalysisRunsCommand());
  program.addCommand(createAnalysisSchemasCommand());
  program.addCommand(createApikeysCommand());
  program.addCommand(createAuthCommand());
  program.addCommand(createBillingCommand());
  program.addCommand(createChatsCommand());
  program.addCommand(createIdentitiesCommand());
  program.addCommand(createMembersCommand());
  program.addCommand(createMessagesCommand());
  program.addCommand(createPlatformLogsCommand());
  program.addCommand(createPlatformsCommand());
  program.addCommand(createProjectsCommand());
  program.addCommand(createWebhooksCommand());

// Add MCP server command
  program.addCommand(createMcpCommand());

program.parse(process.argv);
