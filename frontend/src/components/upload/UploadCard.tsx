'use client';

import { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatFileSize } from '@/lib/utils';

interface UploadCardProps {
  onFileAccepted: (file: File) => void;
  file: File | null;
  onClear: () => void;
  error: string | null;
  isLoading: boolean;
}

export function UploadCard({
  onFileAccepted,
  file,
  onClear,
  error,
  isLoading,
}: UploadCardProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const rejection = rejections[0];
        const errorMessage =
          rejection.errors[0]?.message ?? 'Invalid file. Please upload a CSV.';
        console.warn('File rejected:', errorMessage);
        return;
      }
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <section className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8" id="upload-section">
      <Card className="overflow-hidden border-border/50 shadow-xl shadow-primary/5 transition-shadow hover:shadow-2xl hover:shadow-primary/10">
        <CardContent className="p-0">
          {}
          {!file ? (
            <div
              {...getRootProps()}
              className={cn(
                'group relative flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all duration-300',
                isDragActive && !isDragReject
                  ? 'border-primary bg-primary/5 scale-[1.02]'
                  : isDragReject
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border hover:border-primary/50 hover:bg-primary/[0.02]'
              )}
              id="csv-dropzone"
            >
              <input {...getInputProps()} id="csv-file-input" />

              {}
              <div
                className={cn(
                  'flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
                  isDragActive
                    ? 'bg-primary/15 scale-110'
                    : 'bg-muted group-hover:bg-primary/10'
                )}
              >
                {isDragReject ? (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                ) : (
                  <UploadCloud
                    className={cn(
                      'h-8 w-8 transition-colors',
                      isDragActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-primary'
                    )}
                  />
                )}
              </div>

              {}
              <div className="text-center">
                {isDragReject ? (
                  <p className="text-sm font-medium text-destructive">
                    Only CSV files are accepted
                  </p>
                ) : isDragActive ? (
                  <p className="text-sm font-medium text-primary">
                    Drop your CSV file here
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-medium">
                      <span className="text-primary">Click to upload</span> or drag &
                      drop
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      CSV files up to 10MB • Facebook Leads, Google Ads, any CRM export
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            
            <div className="animate-fade-in flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                id="clear-file-btn"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {}
          {error && (
            <div className="animate-fade-in flex items-center gap-2 border-t border-destructive/20 bg-destructive/5 px-6 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-destructive" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
