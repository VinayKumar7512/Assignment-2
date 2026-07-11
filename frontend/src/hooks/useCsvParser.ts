'use client';

import { useCallback, useState } from 'react';
import Papa from 'papaparse';
import type { CsvPreviewData } from '@/types';

interface UseCsvParserReturn {
  parseFile: (file: File) => void;
  previewData: CsvPreviewData | null;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useCsvParser(): UseCsvParserReturn {
  const [previewData, setPreviewData] = useState<CsvPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback((file: File) => {
    setIsLoading(true);
    setError(null);
    setPreviewData(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      setIsLoading(false);
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size exceeds 10MB limit.');
      setIsLoading(false);
      return;
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      transform: (value: string) => value.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(
            (e) => e.type === 'Delimiter' || e.type === 'FieldMismatch'
          );
          if (criticalErrors.length > 0) {
            setError(`CSV parsing error: ${criticalErrors[0].message}`);
            setIsLoading(false);
            return;
          }
        }

        const headers = results.meta.fields ?? [];
        if (headers.length < 2) {
          setError('CSV must have at least 2 columns.');
          setIsLoading(false);
          return;
        }

        const rows = results.data.filter((row) =>
          Object.values(row).some((val) => val !== '')
        );

        if (rows.length === 0) {
          setError('CSV file has no data rows.');
          setIsLoading(false);
          return;
        }

        setPreviewData({
          headers,
          rows,
          totalRows: rows.length,
          fileName: file.name,
          fileSize: file.size,
        });
        setIsLoading(false);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
        setIsLoading(false);
      },
    });
  }, []);

  const reset = useCallback(() => {
    setPreviewData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { parseFile, previewData, isLoading, error, reset };
}
