// Generated Billing commands for MsgCore CLI
// DO NOT EDIT - This file is auto-generated from backend contracts

import { Command } from 'commander';
import { MsgCore } from '@msgcore/sdk';
import { loadConfig, formatOutput, handleError } from '../lib/utils';


export function createBillingCommand(): Command {
  const billing = new Command('billing');

  billing
    .command('checkout')
    .description('Create Stripe checkout session for subscription upgrade')
    .option('--tier <value>', 'Subscription tier')
    .option('--interval <value>', 'Billing interval')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.billing.checkout({
      tier: options.tier,
      interval: options.interval
        });

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  billing
    .command('portal')
    .description('Access Stripe customer portal to manage subscription')

    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.billing.portal();

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  billing
    .command('subscription')
    .description('Get current subscription details including tier, status, and trial info')

    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.billing.subscription();

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  billing
    .command('usage')
    .description('Get usage statistics for projects, messages, platforms, webhooks with limit warnings')

    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.billing.usage();

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  billing
    .command('sync')
    .description('Manually sync subscription data from Stripe')

    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        // Check permissions
        // No permissions required for this command

        const gk = new MsgCore(config);

        const result = await gk.billing.sync();

        formatOutput(result, options.json);
      } catch (error) {
        handleError(error);
      }
    });

  return billing;
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
