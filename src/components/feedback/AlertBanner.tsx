import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantConfig = {
  error: {
    container: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    dismissColor: 'text-red-500 hover:text-red-700',
  },
  warning: {
    container: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    dismissColor: 'text-amber-500 hover:text-amber-700',
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-500',
    dismissColor: 'text-blue-500 hover:text-blue-700',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon: CheckCircle,
    iconColor: 'text-green-500',
    dismissColor: 'text-green-500 hover:text-green-700',
  },
} as const;

interface AlertBannerProps {
  variant: keyof typeof variantConfig;
  message: string;
  details?: string[];
  onDismiss?: () => void;
}

export default function AlertBanner({ variant, message, details, onDismiss }: AlertBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={cn('w-full rounded-lg border p-4', config.container)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.iconColor)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium', config.text)}>{message}</p>
          {details && details.length > 0 && (
            <ul className={cn('mt-2 list-disc list-inside space-y-1', config.text)}>
              {details.map((detail, i) => (
                <li key={i} className="text-sm">
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={cn('shrink-0 rounded-md p-0.5 transition-colors', config.dismissColor)}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
