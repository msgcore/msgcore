// Generated config management for MsgCore CLI
// DO NOT EDIT - This file is auto-generated

import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

interface CLIConfig {
  apiUrl: string;
  apiKey?: string;
  jwtToken?: string;
  defaultProject?: string;
  outputFormat?: 'table' | 'json';
}

export async function loadConfig(): Promise<CLIConfig> {
  // Start with defaults
  const config: CLIConfig = {
    apiUrl: 'https://api.msgcore.dev',
    outputFormat: 'table',
  };

  // Load from config file (if exists)
  try {
    const configPath = path.join(os.homedir(), '.msgcore', 'config.json');
    const fileConfig = JSON.parse(fsSync.readFileSync(configPath, 'utf-8'));
    Object.assign(config, fileConfig);
  } catch {
    // Config file doesn't exist or is invalid - use defaults
  }

  // Environment variables override config file
  if (process.env.MSGCORE_API_URL) config.apiUrl = process.env.MSGCORE_API_URL;
  if (process.env.MSGCORE_API_KEY) config.apiKey = process.env.MSGCORE_API_KEY;
  if (process.env.MSGCORE_JWT_TOKEN) config.jwtToken = process.env.MSGCORE_JWT_TOKEN;
  if (process.env.MSGCORE_DEFAULT_PROJECT) config.defaultProject = process.env.MSGCORE_DEFAULT_PROJECT;
  if (process.env.MSGCORE_OUTPUT_FORMAT) config.outputFormat = process.env.MSGCORE_OUTPUT_FORMAT as any;

  return config;
}

export async function saveConfig(key: string, value: string): Promise<void> {
  const configDir = path.join(os.homedir(), '.msgcore');
  const configPath = path.join(configDir, 'config.json');

  // Create directory if it doesn't exist
  try {
    await fs.mkdir(configDir, { recursive: true, mode: 0o700 });
  } catch (err) {
    throw new Error(`Failed to create config directory: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Load existing config or start fresh
  let config: Record<string, any> = {};
  try {
    const existing = await fs.readFile(configPath, 'utf-8');
    config = JSON.parse(existing);
  } catch {
    // File doesn't exist yet, that's ok
  }

  // Update the specific key
  config[key] = value;

  // Write config file with restricted permissions
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), { mode: 0o600 });
  } catch (err) {
    throw new Error(`Failed to write config file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function getConfigValue(key: string): Promise<string | undefined> {
  const configPath = path.join(os.homedir(), '.msgcore', 'config.json');

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    return config[key];
  } catch {
    return undefined;
  }
}

export async function listConfig(): Promise<Record<string, any>> {
  const configPath = path.join(os.homedir(), '.msgcore', 'config.json');

  try {
    const configContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch {
    return {};
  }
}

export function formatOutput(data: any, json: boolean = false): void {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    // Simple table output for humans
    if (Array.isArray(data)) {
      console.table(data);
    } else {
      console.log(data);
    }
  }
}

export function handleError(error: any): void {
  if (error.code === 'INSUFFICIENT_PERMISSIONS') {
    console.error(`❌ Permission denied: ${error.message}`);
    console.error('💡 Contact your administrator to request additional permissions.');
  } else if (error.code === 'AUTHENTICATION_ERROR') {
    console.error('❌ Authentication failed. Check your API key or token.');
  } else {
    console.error(`❌ Error: ${error.message}`);
  }
  process.exit(1);
}
