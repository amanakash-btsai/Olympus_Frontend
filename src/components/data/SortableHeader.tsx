import type { Column } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SortableHeaderProps<TData> {
  column: Column<TData, unknown>;
  label: string;
  className?: string;
}

export default function SortableHeader<TData>({
  column,
  label,
  className,
}: SortableHeaderProps<TData>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('-ml-3 h-8', className)}
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      {column.getIsSorted() === 'asc' ? (
        <ArrowUp className="ml-2 h-3.5 w-3.5" />
      ) : column.getIsSorted() === 'desc' ? (
        <ArrowDown className="ml-2 h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-40" />
      )}
    </Button>
  );
}
