'use client';

import { useCallback, useRef, useState } from 'react';
import { startImport } from '@/services/api';
import type { ImportResponse, ProgressEvent } from '@/types';

interface ImportProgress {
  batchIndex: number;
  totalBatches: number;
  message: string;
  batchRecords: number;
  batchSkipped: number;
}

interface UseImportReturn {
  startProcessing: (file: File) => void;
  cancel: () => void;
  progress: ImportProgress | null;
  result: ImportResponse | null;
  error: string | null;
  isImporting: boolean;
  reset: () => void;
}

export function useImport(): UseImportReturn {
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startProcessing = useCallback((file: File) => {
    setIsImporting(true);
    setError(null);
    setResult(null);
    setProgress(null);

    const controller = startImport(
      file,
      (event: ProgressEvent) => {
        setProgress({
          batchIndex: event.batchIndex ?? 0,
          totalBatches: event.totalBatches ?? 0,
          message: event.message ?? '',
          batchRecords: event.batchRecords ?? 0,
          batchSkipped: event.batchSkipped ?? 0,
        });
      },
      (event: ProgressEvent) => {
        if (event.result) {
          setResult(event.result);
        }
        setIsImporting(false);
      },
      (errorMessage: string) => {
        setError(errorMessage);
        setIsImporting(false);
      }
    );

    abortControllerRef.current = controller;
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsImporting(false);
    setError('Import was cancelled.');
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setProgress(null);
    setResult(null);
    setError(null);
    setIsImporting(false);
  }, []);

  return {
    startProcessing,
    cancel,
    progress,
    result,
    error,
    isImporting,
    reset,
  };
}
