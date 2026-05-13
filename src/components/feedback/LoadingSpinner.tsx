import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ text, className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
