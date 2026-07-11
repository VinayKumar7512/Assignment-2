import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import { logger } from '../utils/logger';
import multer from 'multer';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    let message = 'File upload error.';
    let statusCode = 400;

    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size exceeds the maximum allowed limit.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Only one file is allowed.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected field name. Use "file" as the field name.';
        statusCode = 422;
        break;
      default:
        message = `Upload error: ${err.message}`;
    }

    logger.warn(`Multer error: ${err.code} - ${err.message}`);
    res.status(statusCode).json({ error: message });
    return;
  }

  if (err instanceof AppError) {
    logger.warn(`AppError [${err.statusCode}]: ${err.message}`);
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'An unexpected error occurred. Please try again later.',
  });
}
