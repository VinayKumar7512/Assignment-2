'use client';

import { Ban, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface ImportProgressProps {
  batchIndex: number;
  totalBatches: number;
  message: string;
  onCancel: () => void;
}

export function ImportProgress({
  batchIndex,
  totalBatches,
  message,
  onCancel,
}: ImportProgressProps) {
  const progressPercent =
    totalBatches > 0 ? Math.round((batchIndex / totalBatches) * 100) : 0;

  return (
    <section
      className="animate-fade-in-up mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8"
      id="progress-section"
    >
      <Card className="overflow-hidden border-primary/20 shadow-xl shadow-primary/10 animate-pulse-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">AI Processing</CardTitle>
              <p className="text-xs text-muted-foreground">
                Gemini is analyzing your data
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Batch {batchIndex} / {totalBatches}
              </span>
              <span className="text-primary font-semibold">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5" />
          </div>

          {}
          <p className="text-xs text-muted-foreground animate-fade-in">
            {message || 'Initializing...'}
          </p>

          {}
          <div className="flex justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              id="cancel-import-btn"
            >
              <Ban className="mr-1.5 h-3.5 w-3.5" />
              Cancel Import
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
