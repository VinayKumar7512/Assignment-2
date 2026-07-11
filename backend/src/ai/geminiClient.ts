import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AiBatchRequest, AiBatchResult, AppError } from '../types';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';
import { parseAiResponse } from './responseParser';

const MODEL_NAME = 'gemini-flash-latest';

let genAIInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });
  }
  return genAIInstance;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function processBatch(
  batch: AiBatchRequest,
  globalRowOffset: number,
  signal?: AbortSignal
): Promise<AiBatchResult> {
  const genAI = getGenAI();
  const userPrompt = buildUserPrompt(
    batch.columns,
    batch.rows,
    batch.batchIndex,
    globalRowOffset
  );

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= env.AI_MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      throw new AppError('Import was cancelled by the user.', 499);
    }

    try {
      logger.info(
        `Batch ${batch.batchIndex + 1}: Attempt ${attempt}/${env.AI_MAX_RETRIES}`
      );

      const response = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      logger.debug(`Batch ${batch.batchIndex + 1}: Raw AI response length: ${text.length}`);

      const result = parseAiResponse(text, batch.rows.length, globalRowOffset);

      logger.info(
        `Batch ${batch.batchIndex + 1}: ${result.records.length} records, ${result.skipped.length} skipped`
      );

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (signal?.aborted) {
        throw new AppError('Import was cancelled by the user.', 499);
      }

      const isRetryable = isRetryableError(lastError);

      if (isRetryable && attempt < env.AI_MAX_RETRIES) {
        const backoffMs = env.AI_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        logger.warn(
          `Batch ${batch.batchIndex + 1}: Retryable error on attempt ${attempt}, waiting ${backoffMs}ms: ${lastError.message}`
        );
        await sleep(backoffMs);
        continue;
      }

      if (!isRetryable) {
        logger.error(
          `Batch ${batch.batchIndex + 1}: Non-retryable error: ${lastError.message}`
        );
        break;
      }
    }
  }

  throw new AppError(
    `AI processing failed for batch ${batch.batchIndex + 1} after ${env.AI_MAX_RETRIES} attempts: ${lastError?.message ?? 'Unknown error'}`,
    502
  );
}

function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
    return true;
  }

  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return true;
  }

  if (message.includes('timeout') || message.includes('etimedout') || message.includes('econnreset')) {
    return true;
  }

  if (message.includes('network') || message.includes('fetch failed')) {
    return true;
  }

  return false;
}
