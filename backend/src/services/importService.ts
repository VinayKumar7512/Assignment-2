import { Response } from 'express';
import {
  AiBatchRequest,
  AiBatchResult,
  CrmRecord,
  ImportResponse,
  ParsedCsvData,
  ProgressEvent,
  SkippedRecord,
} from '../types';
import { createBatches, estimateProcessingTime } from '../utils/batchProcessor';
import { processBatch } from '../ai/geminiClient';
import { logger } from '../utils/logger';

export async function processImport(
  parsedCsv: ParsedCsvData,
  res: Response,
  signal?: AbortSignal
): Promise<void> {
  const { rows, columns, rowCount } = parsedCsv;
  const batches: AiBatchRequest[] = createBatches(rows, columns);
  const estimatedTime = estimateProcessingTime(rowCount);

  logger.info(
    `Starting import: ${rowCount} rows, ${batches.length} batches, ~${estimatedTime}s estimated`
  );

  sendSSE(res, {
    type: 'progress',
    message: `Starting import of ${rowCount} rows in ${batches.length} batches (~${estimatedTime}s)`,
    batchIndex: 0,
    totalBatches: batches.length,
  });

  const allRecords: CrmRecord[] = [];
  const allSkipped: SkippedRecord[] = [];

  for (let i = 0; i < batches.length; i++) {
    if (signal?.aborted) {
      logger.info('Import cancelled by user');
      sendSSE(res, {
        type: 'error',
        message: 'Import was cancelled.',
      });
      res.end();
      return;
    }

    const batch = batches[i];
    const globalRowOffset = i * batches[0].rows.length;

    try {
      sendSSE(res, {
        type: 'progress',
        batchIndex: i + 1,
        totalBatches: batches.length,
        message: `Processing batch ${i + 1} of ${batches.length}...`,
      });

      const result: AiBatchResult = await processBatch(batch, globalRowOffset, signal);

      allRecords.push(...result.records);
      allSkipped.push(...result.skipped);

      sendSSE(res, {
        type: 'progress',
        batchIndex: i + 1,
        totalBatches: batches.length,
        batchRecords: result.records.length,
        batchSkipped: result.skipped.length,
        message: `Batch ${i + 1}/${batches.length} complete: ${result.records.length} records, ${result.skipped.length} skipped`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Batch ${i + 1} failed: ${errorMessage}`);

      const batchSkipped: SkippedRecord[] = batch.rows.map((row, idx) => ({
        row: globalRowOffset + idx + 1,
        data: row,
        reason: `AI processing failed: ${errorMessage}`,
      }));
      allSkipped.push(...batchSkipped);

      sendSSE(res, {
        type: 'progress',
        batchIndex: i + 1,
        totalBatches: batches.length,
        batchRecords: 0,
        batchSkipped: batch.rows.length,
        message: `Batch ${i + 1} failed — ${batch.rows.length} rows skipped: ${errorMessage}`,
      });
    }
  }

  const importResponse: ImportResponse = {
    records: allRecords,
    skipped: allSkipped,
    summary: {
      total: rowCount,
      imported: allRecords.length,
      skipped: allSkipped.length,
    },
  };

  logger.info(
    `Import complete: ${allRecords.length} imported, ${allSkipped.length} skipped out of ${rowCount} total`
  );

  sendSSE(res, {
    type: 'complete',
    message: 'Import complete',
    result: importResponse,
  });

  res.end();
}

function sendSSE(res: Response, event: ProgressEvent): void {
  try {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  } catch (error) {
    logger.warn('Failed to send SSE event — client may have disconnected');
  }
}
