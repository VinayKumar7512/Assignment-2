'use client';

import { CheckCircle2, XCircle, FileStack } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ImportSummary } from '@/types';
import { formatNumber } from '@/lib/utils';

interface SummaryCardsProps {
  summary: ImportSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Rows',
      value: summary.total,
      icon: FileStack,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10',
      delay: '',
    },
    {
      label: 'Imported',
      value: summary.imported,
      icon: CheckCircle2,
      color: 'text-success',
      bgColor: 'bg-success/10',
      delay: 'animation-delay-100',
    },
    {
      label: 'Skipped',
      value: summary.skipped,
      icon: XCircle,
      color: summary.skipped > 0 ? 'text-warning' : 'text-muted-foreground',
      bgColor: summary.skipped > 0 ? 'bg-warning/10' : 'bg-muted',
      delay: 'animation-delay-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" id="summary-cards">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`animate-fade-in-up ${card.delay} overflow-hidden border-border/50 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5`}
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${card.bgColor}`}
            >
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </p>
              <p className={`animate-count-up text-2xl font-bold ${card.color}`}>
                {formatNumber(card.value)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
