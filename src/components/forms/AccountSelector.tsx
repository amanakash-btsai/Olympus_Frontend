import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import type { Account } from '@/types/account.types';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from '@/api/axiosInstance';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface AccountSelectorProps {
  value?: string;
  displayValue?: string;
  onChange: (accountId: string, account: Account) => void;
  placeholder?: string;
  className?: string;
}

export default function AccountSelector({
  value,
  displayValue,
  onChange,
  placeholder = 'Search accounts…',
  className,
}: AccountSelectorProps) {
  const [search, setSearch] = useState(displayValue ?? '');
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', 'combobox', debouncedSearch],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Account[]>>('/api/accounts', {
        params: { search: debouncedSearch },
      });
      return data.data;
    },
    enabled: debouncedSearch.length >= 1,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {open && accounts.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {accounts.map((acc) => (
            <li
              key={acc.account_id}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm hover:bg-gray-50',
                value === acc.account_id && 'bg-blue-50',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(acc.account_id, acc);
                setSearch(acc.account_name);
                setOpen(false);
              }}
            >
              <p className="font-medium text-gray-900">{acc.account_name}</p>
              {acc.hospital_name && (
                <p className="text-xs text-gray-500">{acc.hospital_name}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
