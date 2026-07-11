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
import { ArrowUpDown, ChevronLeft, ChevronRight, Rows3 } from 'lucide-react';
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
import type { CsvPreviewData } from '@/types';
import { formatFileSize, formatNumber, estimateTime, truncate } from '@/lib/utils';

interface CsvPreviewProps {
  data: CsvPreviewData;
  onConfirmImport: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

const columnHelper = createColumnHelper<Record<string, string>>();

export function CsvPreview({
  data,
  onConfirmImport,
  onCancel,
  isImporting,
}: CsvPreviewProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () =>
      data.headers.map((header) =>
        columnHelper.accessor(header, {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 font-semibold"
              onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
              {header}
              <ArrowUpDown className="ml-1.5 h-3 w-3" />
            </Button>
          ),
          cell: (info) => {
            const value = info.getValue();
            return (
              <span className="block max-w-[200px]" title={value}>
                {truncate(value || '—', 40)}
              </span>
            );
          },
        })
      ),
    [data.headers]
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: data.rows,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <section
      className="animate-fade-in-up mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      id="preview-section"
    >
      <Card className="overflow-hidden border-border/50 shadow-xl shadow-primary/5">
        {}
        <CardHeader className="border-b bg-muted/30 px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Rows3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">CSV Preview</CardTitle>
                <p className="text-xs text-muted-foreground">{data.fileName}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatNumber(data.totalRows)} rows
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {data.headers.length} columns
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {formatFileSize(data.fileSize)}
              </Badge>
              <Badge variant="outline" className="text-xs text-primary">
                ETA {estimateTime(data.totalRows)}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {}
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                {table.getHeaderGroups().map((headerGroup) => (
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="transition-colors hover:bg-muted/40">
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {row.index + 1 + table.getState().pagination.pageIndex * table.getState().pagination.pageSize}
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
                    <TableCell
                      colSpan={data.headers.length + 1}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No data
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                id="prev-page-btn"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                id="next-page-btn"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {}
          <div className="flex flex-col gap-3 border-t bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isImporting}
              className="rounded-xl"
              id="cancel-preview-btn"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirmImport}
              disabled={isImporting}
              className="rounded-xl shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              id="confirm-import-btn"
            >
              {isImporting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Processing...
                </span>
              ) : (
                `Import ${formatNumber(data.totalRows)} Rows with AI`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
