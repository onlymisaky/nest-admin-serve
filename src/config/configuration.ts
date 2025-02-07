import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import * as yaml from 'js-yaml';
import { AppConfig } from './config.interface';
import { validateConfig } from './validation.schema';

function getConfigPath(): string {
  // 优先使用环境变量
  if (process.env.CONFIG_PATH) {
    return process.env.CONFIG_PATH;
  }

  const configDir = path.join(process.cwd(), 'config');

  return configDir;
}

function mergeConfig(defaultConfig: AppConfig, envConfig: AppConfig): AppConfig {
  const merged = {
    server: {
      ...defaultConfig.server,
      ...envConfig.server,
    },
    mysql: {
      ...defaultConfig.mysql,
      ...envConfig.mysql,
    },
    jwt: {
      ...defaultConfig.jwt,
      ...envConfig.jwt,
    },
    redis: {
      ...defaultConfig.redis,
      ...envConfig.redis,
    },
  };

  // 验证合并后的配置
  validateConfig(merged);
  return merged;
}

export function getEnv(): 'development' | 'production' | '' {
  let env = process.env.ENVIRONMENT;
  if (!['development', 'production'].includes(env)) {
    env = '';
  }
  return env as 'development' | 'production' | '';
}

export function getDefaultConfig(): AppConfig {
  const configDir = getConfigPath();
  const configFile = path.join(configDir, 'default.yaml');

  if (fs.existsSync(configFile)) {
    const data = fs.readFileSync(configFile, 'utf8');
    const config = yaml.load(data) as AppConfig;

    return config;
  }
  return {} as AppConfig;
}

export function getConfig(): AppConfig {
  const defaultConfig = getDefaultConfig();
  const env = getEnv();

  if (env === '') {
    return defaultConfig;
  }

  const envName = `${env}.yaml`;
  const envPath = path.join(getConfigPath(), envName);

  if (fs.existsSync(envPath)) {
    const data = fs.readFileSync(envPath, 'utf8');
    const envConfig = yaml.load(data) as AppConfig;

    return mergeConfig(defaultConfig || {}, envConfig || {});
  }

  return defaultConfig;
}
