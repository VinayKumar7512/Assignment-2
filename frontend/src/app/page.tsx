'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/hero/Hero';
import { UploadCard } from '@/components/upload/UploadCard';
import { CsvPreview } from '@/components/preview/CsvPreview';
import { ImportProgress } from '@/components/progress/ImportProgress';
import { ResultsTable } from '@/components/results/ResultsTable';
import { useCsvParser } from '@/hooks/useCsvParser';
import { useImport } from '@/hooks/useImport';
import type { ImportStep } from '@/types';

export default function HomePage() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);

  const uploadRef = useRef<HTMLDivElement>(null);

  const {
    parseFile,
    previewData,
    isLoading: isParsing,
    error: parseError,
    reset: resetParser,
  } = useCsvParser();

  const {
    startProcessing,
    cancel: cancelImport,
    progress,
    result,
    error: importError,
    isImporting,
    reset: resetImport,
  } = useImport();

  const scrollToUpload = useCallback(() => {
    uploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleFileAccepted = useCallback(
    (acceptedFile: File) => {
      setFile(acceptedFile);
      parseFile(acceptedFile);
      setStep('preview');
      toast.success(`File "${acceptedFile.name}" loaded successfully`);
    },
    [parseFile]
  );

  const handleClearFile = useCallback(() => {
    setFile(null);
    resetParser();
    resetImport();
    setStep('upload');
  }, [resetParser, resetImport]);

  const handleConfirmImport = useCallback(() => {
    if (!file) return;
    setStep('importing');
    toast.info('Starting AI-powered import...');
    startProcessing(file);
  }, [file, startProcessing]);

  const handleCancelImport = useCallback(() => {
    cancelImport();
    setStep('preview');
    toast.warning('Import cancelled');
  }, [cancelImport]);

  const handleReset = useCallback(() => {
    setFile(null);
    resetParser();
    resetImport();
    setStep('upload');
    scrollToUpload();
    toast.info('Ready for a new import');
  }, [resetParser, resetImport, scrollToUpload]);

  useEffect(() => {
    if (result && step === 'importing') {
      setStep('results');
      toast.success(
        `Import complete: ${result.summary.imported} imported, ${result.summary.skipped} skipped`
      );
    }
  }, [result, step]);

  useEffect(() => {
    if (importError && step === 'importing') {
      setStep('preview');
      toast.error(importError);
    }
  }, [importError, step]);

  return (
    <>
      <Header />

      <main className="flex-1">
        {}
        <Hero onGetStarted={scrollToUpload} />

        {}
        <div ref={uploadRef} className="py-8">
          <div className="mx-auto mb-6 max-w-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight">Upload Your CSV</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Any format, any source — our AI handles the rest
            </p>
          </div>
          <UploadCard
            onFileAccepted={handleFileAccepted}
            file={file}
            onClear={handleClearFile}
            error={parseError}
            isLoading={isParsing}
          />
        </div>

        {}
        {step === 'preview' && previewData && (
          <div className="py-8">
            <CsvPreview
              data={previewData}
              onConfirmImport={handleConfirmImport}
              onCancel={handleClearFile}
              isImporting={isImporting}
            />
          </div>
        )}

        {}
        {step === 'importing' && progress && (
          <div className="py-8">
            <ImportProgress
              batchIndex={progress.batchIndex}
              totalBatches={progress.totalBatches}
              message={progress.message}
              onCancel={handleCancelImport}
            />
          </div>
        )}

        {}
        {step === 'results' && result && (
          <div className="py-8">
            <ResultsTable result={result} onReset={handleReset} />
          </div>
        )}

        {}
        <div className="h-16" />
      </main>

      <Footer />
    </>
  );
}
