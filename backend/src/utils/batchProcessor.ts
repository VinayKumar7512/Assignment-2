import { AiBatchRequest } from '../types';
import { env } from '../config/env';

export function createBatches(
  rows: Record<string, string>[],
  columns: string[]
): AiBatchRequest[] {
  const batchSize = env.AI_BATCH_SIZE;
  const batches: AiBatchRequest[] = [];

  for (let i = 0; i < rows.length; i += batchSize) {
    batches.push({
      batchIndex: Math.floor(i / batchSize),
      rows: rows.slice(i, i + batchSize),
      columns,
    });
  }

  return batches;
}

export function estimateProcessingTime(rowCount: number): number {
  const batchSize = env.AI_BATCH_SIZE;
  const batchCount = Math.ceil(rowCount / batchSize);
  const secondsPerBatch = 2;
  return batchCount * secondsPerBatch;
}
