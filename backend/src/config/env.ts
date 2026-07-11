import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;
  GEMINI_API_KEY: string;
  MAX_FILE_SIZE_MB: number;
  AI_BATCH_SIZE: number;
  AI_MAX_RETRIES: number;
  AI_RETRY_DELAY_MS: number;
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const raw = process.env[key];
  if (raw === undefined) return defaultValue;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${raw}`);
  }
  return parsed;
}

export const env: EnvConfig = {
  PORT: getEnvNumber('PORT', 3001),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY'),
  MAX_FILE_SIZE_MB: getEnvNumber('MAX_FILE_SIZE_MB', 10),
  AI_BATCH_SIZE: getEnvNumber('AI_BATCH_SIZE', 25),
  AI_MAX_RETRIES: getEnvNumber('AI_MAX_RETRIES', 3),
  AI_RETRY_DELAY_MS: getEnvNumber('AI_RETRY_DELAY_MS', 1000),
};
