import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { validateCsv, parseCsv } from '../utils/csvParser';
import { processImport } from '../services/importService';
import { estimateProcessingTime } from '../utils/batchProcessor';
import { logger } from '../utils/logger';

const activeImports = new Map<string, AbortController>();

export async function handleImport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded. Please upload a CSV file.', 400);
    }

    const { buffer, originalname } = req.file;
    logger.info(`Received file: ${originalname} (${buffer.length} bytes)`);

    const validation = validateCsv(buffer);
    if (!validation.valid) {
      throw new AppError(validation.error ?? 'Invalid CSV file.', 400);
    }

    logger.info(
      `CSV validated: ${validation.rowCount} rows, ${validation.columns?.length} columns`
    );

    const parsedCsv = parseCsv(buffer);

    const importId = `import_${Date.now()}`;

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Import-Id': importId,
      'X-Row-Count': String(parsedCsv.rowCount),
      'X-Estimated-Time': String(estimateProcessingTime(parsedCsv.rowCount)),
    });

    const abortController = new AbortController();
    activeImports.set(importId, abortController);

    res.on('close', () => {
      logger.info(`Client disconnected for import ${importId}`);
      abortController.abort();
      activeImports.delete(importId);
    });

    await processImport(parsedCsv, res, abortController.signal);

    activeImports.delete(importId);
  } catch (error) {
    next(error);
  }
}

export function handleCancelImport(
  req: Request,
  res: Response
): void {
  const { importId } = req.body as { importId: string };

  if (!importId) {
    res.status(400).json({ error: 'importId is required.' });
    return;
  }

  const controller = activeImports.get(importId);
  if (!controller) {
    res.status(404).json({ error: 'No active import found with that ID.' });
    return;
  }

  controller.abort();
  activeImports.delete(importId);
  logger.info(`Import ${importId} cancelled by user`);

  res.json({ message: 'Import cancelled successfully.' });
}

export function handleHealthCheck(
  _req: Request,
  res: Response
): void {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
