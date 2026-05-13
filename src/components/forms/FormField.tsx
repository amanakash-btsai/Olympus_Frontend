import type { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  error?: FieldError;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  name,
  error,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {error?.message && (
        <p className="text-xs text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
}
