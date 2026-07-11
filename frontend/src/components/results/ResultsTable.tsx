'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import Papa from 'papaparse';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SummaryCards } from './SummaryCards';
import type { ImportResponse, CrmRecord, SkippedRecord } from '@/types';
import { downloadFile, truncate } from '@/lib/utils';

interface ResultsTableProps {
  result: ImportResponse;
  onReset: () => void;
}

type TabView = 'imported' | 'skipped';

const CRM_DISPLAY_COLUMNS: { key: keyof CrmRecord; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'country_code', label: 'Code' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'lead_owner', label: 'Lead Owner' },
  { key: 'crm_status', label: 'Status' },
  { key: 'data_source', label: 'Source' },
  { key: 'crm_note', label: 'Notes' },
  { key: 'created_at', label: 'Created At' },
  { key: 'possession_time', label: 'Possession' },
  { key: 'description', label: 'Description' },
];

const recordColumnHelper = createColumnHelper<CrmRecord>();
const skippedColumnHelper = createColumnHelper<SkippedRecord>();

function StatusBadge({ status }: { status: string }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const colorMap: Record<string, string> = {
    GOOD_LEAD_FOLLOW_UP: 'bg-success/10 text-success border-success/20',
    DID_NOT_CONNECT: 'bg-warning/10 text-warning border-warning/20',
    BAD_LEAD: 'bg-destructive/10 text-destructive border-destructive/20',
    SALE_DONE: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
  };

  return (
    <Badge
      variant="outline"
      className={`whitespace-nowrap text-[10px] font-medium ${colorMap[status] ?? ''}`}
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

export function ResultsTable({ result, onReset }: ResultsTableProps) {
  const [activeTab, setActiveTab] = useState<TabView>('imported');
  const [importedSorting, setImportedSorting] = useState<SortingState>([]);
  const [skippedSorting, setSkippedSorting] = useState<SortingState>([]);

  const importedColumns = useMemo(
    () =>
      CRM_DISPLAY_COLUMNS.map((col) =>
        recordColumnHelper.accessor(col.key, {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 text-xs font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {col.label}
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          ),
          cell: (info) => {
            const value = info.getValue();
            if (col.key === 'crm_status') {
              return <StatusBadge status={value} />;
            }
            return (
              <span className="block max-w-[180px]" title={value}>
                {truncate(value || '—', 35)}
              </span>
            );
          },
        })
      ),
    []
  );

  const skippedColumns = useMemo(
    () => [
      skippedColumnHelper.accessor('row', {
        header: 'Row',
        cell: (info) => (
          <span className="font-medium text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      skippedColumnHelper.accessor('reason', {
        header: 'Reason',
        cell: (info) => (
          <span className="text-destructive">{info.getValue()}</span>
        ),
      }),
    ],
    []
  );

  const [importedPagination, setImportedPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });
  const [skippedPagination, setSkippedPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });

  const importedTable = useReactTable({
    data: result.records,
    columns: importedColumns,
    state: { sorting: importedSorting, pagination: importedPagination },
    onSortingChange: setImportedSorting,
    onPaginationChange: setImportedPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const skippedTable = useReactTable({
    data: result.skipped,
    columns: skippedColumns,
    state: { sorting: skippedSorting, pagination: skippedPagination },
    onSortingChange: setSkippedSorting,
    onPaginationChange: setSkippedPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDownloadJSON = () => {
    const json = JSON.stringify(result, null, 2);
    downloadFile(json, 'groweasy-crm-import.json', 'application/json');
  };

  const handleDownloadCSV = () => {
    const csv = Papa.unparse(result.records);
    downloadFile(csv, 'groweasy-crm-import.csv', 'text/csv');
  };

  return (
    <section
      className="animate-fade-in-up mx-auto w-full max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8"
      id="results-section"
    >
      {}
      <SummaryCards summary={result.summary} />

      {}
      <Card className="overflow-hidden border-border/50 shadow-xl shadow-primary/5">
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">
                  Import Results
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  AI-mapped CRM records
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJSON}
                className="rounded-lg text-xs"
                id="download-json-btn"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                className="rounded-lg text-xs"
                id="download-csv-btn"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                CSV
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                className="rounded-lg text-xs"
                id="import-another-btn"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Import Another
              </Button>
            </div>
          </div>
        </CardHeader>

        {}
        <div className="flex border-b bg-muted/20 px-6">
          <button
            onClick={() => setActiveTab('imported')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'imported'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            id="tab-imported"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Imported ({result.records.length})
          </button>
          <button
            onClick={() => setActiveTab('skipped')}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'skipped'
                ? 'border-warning text-warning'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            id="tab-skipped"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Skipped ({result.skipped.length})
          </button>
        </div>

        <CardContent className="p-0">
          {}
          {activeTab === 'imported' && (
            <>
              <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                    {importedTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        <TableHead className="w-12 text-center text-xs font-medium text-muted-foreground">
                          #
                        </TableHead>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="whitespace-nowrap text-xs">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {importedTable.getRowModel().rows.length > 0 ? (
                      importedTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="transition-colors hover:bg-muted/40">
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {row.index + 1 + importedTable.getState().pagination.pageIndex * importedTable.getState().pagination.pageSize}
                          </TableCell>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="whitespace-nowrap text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={CRM_DISPLAY_COLUMNS.length + 1} className="h-24 text-center text-muted-foreground">
                          No records imported
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Page {importedTable.getState().pagination.pageIndex + 1} of {importedTable.getPageCount() || 1}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => importedTable.previousPage()} disabled={!importedTable.getCanPreviousPage()} id="results-prev-page">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => importedTable.nextPage()} disabled={!importedTable.getCanNextPage()} id="results-next-page">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {}
          {activeTab === 'skipped' && (
            <>
              <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                    {skippedTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        <TableHead className="w-12 text-center text-xs font-medium text-muted-foreground">
                          #
                        </TableHead>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="whitespace-nowrap text-xs">
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {skippedTable.getRowModel().rows.length > 0 ? (
                      skippedTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="transition-colors hover:bg-muted/40">
                          <TableCell className="text-center text-xs text-muted-foreground">
                            {row.index + 1 + skippedTable.getState().pagination.pageIndex * skippedTable.getState().pagination.pageSize}
                          </TableCell>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="whitespace-nowrap text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                          No records skipped — all rows imported successfully! 🎉
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Page {skippedTable.getState().pagination.pageIndex + 1} of {skippedTable.getPageCount() || 1}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => skippedTable.previousPage()} disabled={!skippedTable.getCanPreviousPage()} id="skipped-prev-page">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => skippedTable.nextPage()} disabled={!skippedTable.getCanNextPage()} id="skipped-next-page">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
