import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import * as yaml from 'js-yaml';

export function getEnv(): 'development' | 'production' | '' {
  let env = process.env.ENVIRONMENT;
  if (!['development', 'production'].includes(env)) {
    env = '';
  }
  return env as 'development' | 'production' | '';
}

export function getDefaultConfig() {
  const configPath = path.resolve(__dirname, 'config.yaml');
  if (fs.existsSync(configPath)) {
    const data = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(data);
    return config;
  }
  return {};
}

export function getConfig() {
  const env = getEnv();
  if (env === '') {
    return getDefaultConfig();
  }
  const envName = `config.${env}.yaml`;
  const envPath = path.resolve(__dirname, envName);
  if (fs.existsSync(envPath)) {
    const data = fs.readFileSync(envPath, 'utf8');
    const config = yaml.load(data);
    return config;
  }
  return getDefaultConfig();
}
