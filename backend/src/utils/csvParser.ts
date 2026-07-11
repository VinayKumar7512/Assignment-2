import Papa from 'papaparse';
import { AppError, CsvValidationResult, ParsedCsvData } from '../types';
import { logger } from './logger';

const MAX_ROWS = 10000;
const MIN_COLUMNS = 2;

export function validateCsv(buffer: Buffer): CsvValidationResult {
  const content = buffer.toString('utf-8').trim();

  if (!content) {
    return { valid: false, error: 'The CSV file is empty.' };
  }

  if (!content.includes('\n') && !content.includes('\r')) {
    return { valid: false, error: 'The CSV file has no data rows — only a header was found.' };
  }

  try {
    const parsed = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      preview: MAX_ROWS + 1,
    });

    if (parsed.errors.length > 0) {
      const firstError = parsed.errors[0];
      logger.warn('CSV parse warning', { error: firstError });
      if (firstError.type === 'Delimiter' || firstError.type === 'FieldMismatch') {
        return {
          valid: false,
          error: `Malformed CSV: ${firstError.message} (row ${firstError.row})`,
        };
      }
    }

    const columns = parsed.meta.fields ?? [];
    if (columns.length < MIN_COLUMNS) {
      return {
        valid: false,
        error: `CSV must have at least ${MIN_COLUMNS} columns, found ${columns.length}.`,
      };
    }

    if (parsed.data.length === 0) {
      return { valid: false, error: 'The CSV file has no data rows.' };
    }

    if (parsed.data.length > MAX_ROWS) {
      return {
        valid: false,
        error: `CSV has more than ${MAX_ROWS} rows. Please split the file.`,
      };
    }

    return {
      valid: true,
      rowCount: parsed.data.length,
      columns,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown parsing error';
    return { valid: false, error: `Failed to parse CSV: ${message}` };
  }
}

export function parseCsv(buffer: Buffer): ParsedCsvData {
  const content = buffer.toString('utf-8').trim();

  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header: string) => header.trim(),
    transform: (value: string) => value.trim(),
  });

  if (!parsed.meta.fields || parsed.meta.fields.length === 0) {
    throw new AppError('Could not determine CSV columns.', 400);
  }

  const rows = parsed.data.filter((row) => {
    return Object.values(row).some((val) => val !== '');
  });

  logger.info(`Parsed CSV: ${rows.length} rows, ${parsed.meta.fields.length} columns`);

  return {
    rows,
    columns: parsed.meta.fields,
    rowCount: rows.length,
  };
}
