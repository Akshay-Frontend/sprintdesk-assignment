import { type ReactNode, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Skeleton } from './Skeleton';

export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  loading?: boolean;
  loadingRows?: number;
  onRowClick?: (row: T) => void;
  caption?: string;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No results',
  loading,
  loadingRows = 5,
  onRowClick,
  caption,
}: DataTableProps<T>) {
  const [sortId, setSortId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const sorted = useMemo(() => {
    if (!sortId || !sortDir) return data;
    const col = columns.find((c) => c.id === sortId);
    if (!col?.sortValue) return data;
    const sortValue = col.sortValue;
    const arr = [...data].sort((a, b) => {
      const av = sortValue(a);
      const bv = sortValue(b);
      if (av === bv) return 0;
      return av > bv ? 1 : -1;
    });
    return sortDir === 'desc' ? arr.reverse() : arr;
  }, [data, sortId, sortDir, columns]);

  function toggleSort(id: string) {
    if (sortId !== id) {
      setSortId(id);
      setSortDir('asc');
    } else if (sortDir === 'asc') setSortDir('desc');
    else {
      setSortId(null);
      setSortDir(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-bg-subtle">
          <tr>
            {columns.map((c) => {
              const isSorted = sortId === c.id;
              const sortable = !!c.sortValue;
              return (
                <th
                  key={c.id}
                  scope="col"
                  aria-sort={
                    isSorted
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : sortable
                        ? 'none'
                        : undefined
                  }
                  className={cn(
                    'px-3 py-2.5 text-left font-medium text-fg-muted',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.className,
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(c.id)}
                      className="inline-flex items-center gap-1 hover:text-fg"
                    >
                      {c.header}
                      {isSorted ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={`sk-${i}`}>
                {columns.map((c) => (
                  <td key={c.id} className="px-3 py-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-8 text-center text-fg-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  'bg-bg',
                  onRowClick && 'cursor-pointer hover:bg-bg-subtle',
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={cn(
                      'px-3 py-2.5 text-fg',
                      c.align === 'right' && 'text-right',
                      c.align === 'center' && 'text-center',
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
