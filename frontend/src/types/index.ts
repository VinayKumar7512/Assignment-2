export const CRM_STATUS_VALUES = [
  'GOOD_LEAD_FOLLOW_UP',
  'DID_NOT_CONNECT',
  'BAD_LEAD',
  'SALE_DONE',
] as const;

export type CrmStatus = (typeof CRM_STATUS_VALUES)[number];

export const DATA_SOURCE_VALUES = [
  'leads_on_demand',
  'meridian_tower',
  'eden_park',
  'varah_swamy',
  'sarjapur_plots',
] as const;

export type DataSource = (typeof DATA_SOURCE_VALUES)[number];

export interface CrmRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: CrmStatus | '';
  crm_note: string;
  data_source: DataSource | '';
  possession_time: string;
  description: string;
}

export interface SkippedRecord {
  row: number;
  data: Record<string, string>;
  reason: string;
}

export interface ImportSummary {
  total: number;
  imported: number;
  skipped: number;
}

export interface ImportResponse {
  records: CrmRecord[];
  skipped: SkippedRecord[];
  summary: ImportSummary;
}

export interface ProgressEvent {
  type: 'progress' | 'complete' | 'error';
  batchIndex?: number;
  totalBatches?: number;
  batchRecords?: number;
  batchSkipped?: number;
  message?: string;
  result?: ImportResponse;
}

export type ImportStep = 'upload' | 'preview' | 'importing' | 'results';

export interface CsvPreviewData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  fileName: string;
  fileSize: number;
}
