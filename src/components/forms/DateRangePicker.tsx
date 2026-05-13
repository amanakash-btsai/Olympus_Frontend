import { format } from 'date-fns';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value?: Partial<DateRange>;
  onChange: (range: DateRange) => void;
  className?: string;
}

function toInputValue(d?: Date): string {
  return d ? format(d, 'yyyy-MM-dd') : '';
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  function handleStart(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return;
    const startDate = parseDate(e.target.value);
    const endDate = value?.endDate ?? startDate;
    onChange({ startDate, endDate: endDate < startDate ? startDate : endDate });
  }

  function handleEnd(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.value) return;
    const endDate = parseDate(e.target.value);
    const startDate = value?.startDate ?? endDate;
    onChange({ startDate: startDate > endDate ? endDate : startDate, endDate });
  }

  return (
    <div className={cn('flex items-end gap-2', className)}>
      <div className="flex-1 space-y-1">
        <label className="block text-xs font-medium text-gray-500">From</label>
        <Input
          type="date"
          value={toInputValue(value?.startDate)}
          max={toInputValue(value?.endDate)}
          onChange={handleStart}
        />
      </div>
      <span className="pb-2.5 text-gray-400 select-none">–</span>
      <div className="flex-1 space-y-1">
        <label className="block text-xs font-medium text-gray-500">To</label>
        <Input
          type="date"
          value={toInputValue(value?.endDate)}
          min={toInputValue(value?.startDate)}
          onChange={handleEnd}
        />
      </div>
    </div>
  );
}
