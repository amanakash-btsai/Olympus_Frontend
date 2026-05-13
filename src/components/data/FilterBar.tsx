import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  children: React.ReactNode;
  onApply: () => void;
  onReset: () => void;
  className?: string;
}

export default function FilterBar({ children, onApply, onReset, className }: FilterBarProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4',
        className,
      )}
    >
      {children}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" type="button" onClick={onReset}>
          Reset
        </Button>
        <Button size="sm" type="button" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
