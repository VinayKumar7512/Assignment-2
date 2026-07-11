import {
  AiBatchResult,
  CrmRecord,
  SkippedRecord,
  CRM_STATUS_VALUES,
  DATA_SOURCE_VALUES,
  CrmStatus,
  DataSource,
} from '../types';
import { logger } from '../utils/logger';

const CRM_FIELDS: (keyof CrmRecord)[] = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
];

export function parseAiResponse(
  rawText: string,
  expectedRowCount: number,
  _globalRowOffset: number
): AiBatchResult {
  let parsed: unknown;

  try {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    }
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    parsed = JSON.parse(cleaned);
  } catch (err) {
    logger.error('Failed to parse AI response as JSON', { rawText: rawText.substring(0, 500) });
    throw new Error(`AI returned invalid JSON: ${(err as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('AI response is not a valid object.');
  }

  const response = parsed as Record<string, unknown>;

  const rawRecords = Array.isArray(response.records) ? response.records : [];
  const rawSkipped = Array.isArray(response.skipped) ? response.skipped : [];

  const records: CrmRecord[] = [];
  for (const raw of rawRecords) {
    if (!raw || typeof raw !== 'object') continue;
    const record = sanitizeRecord(raw as Record<string, unknown>);
    records.push(record);
  }

  const skipped: SkippedRecord[] = [];
  for (const raw of rawSkipped) {
    if (!raw || typeof raw !== 'object') continue;
    const skip = sanitizeSkipped(raw as Record<string, unknown>);
    skipped.push(skip);
  }

  const totalProcessed = records.length + skipped.length;
  if (totalProcessed < expectedRowCount) {
    logger.warn(
      `AI processed ${totalProcessed} rows but expected ${expectedRowCount}. ` +
      `${expectedRowCount - totalProcessed} rows may have been silently dropped.`
    );
  }

  return { records, skipped };
}

function sanitizeRecord(raw: Record<string, unknown>): CrmRecord {
  const record: Record<string, string> = {};

  for (const field of CRM_FIELDS) {
    const value = raw[field];
    record[field] = typeof value === 'string' ? value.trim() : '';
  }

  if (record.crm_status && !CRM_STATUS_VALUES.includes(record.crm_status as CrmStatus)) {
    logger.debug(`Invalid crm_status "${record.crm_status}", clearing to empty`);
    record.crm_status = '';
  }

  if (record.data_source && !DATA_SOURCE_VALUES.includes(record.data_source as DataSource)) {
    logger.debug(`Invalid data_source "${record.data_source}", clearing to empty`);
    record.data_source = '';
  }

  if (record.created_at) {
    const date = new Date(record.created_at);
    if (isNaN(date.getTime())) {
      logger.debug(`Invalid created_at "${record.created_at}", clearing to empty`);
      record.created_at = '';
    } else {
      record.created_at = date.toISOString();
    }
  }

  if (record.email && !isBasicEmail(record.email)) {
    logger.debug(`Invalid email "${record.email}", clearing to empty`);
    record.email = '';
  }

  if (record.mobile_without_country_code) {
    record.mobile_without_country_code = record.mobile_without_country_code.replace(
      /[^\d]/g,
      ''
    );
  }

  if (record.country_code && !record.country_code.startsWith('+')) {
    record.country_code = `+${record.country_code}`;
  }

  return record as unknown as CrmRecord;
}

function sanitizeSkipped(raw: Record<string, unknown>): SkippedRecord {
  return {
    row: typeof raw.row === 'number' ? raw.row : 0,
    data: typeof raw.data === 'object' && raw.data !== null
      ? raw.data as Record<string, string>
      : {},
    reason: typeof raw.reason === 'string' ? raw.reason : 'Unknown reason',
  };
}

function isBasicEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
