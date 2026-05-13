import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import type { Asset } from '@/types/asset.types';
import type { AssetStatus } from '@/types/enums';
import type { ApiResponse } from '@/types/api.types';
import { apiClient } from '@/api/axiosInstance';
import { useDebounce } from '@/hooks/useDebounce';
import { Input } from '@/components/ui/Input';
import AssetStatusBadge from '@/components/status/AssetStatusBadge';
import { cn } from '@/lib/utils';

interface AssetSelectorProps {
  value?: string;
  displayValue?: string;
  onChange: (assetId: string, asset: Asset) => void;
  statusFilter?: AssetStatus;
  placeholder?: string;
  className?: string;
}

export default function AssetSelector({
  value,
  displayValue,
  onChange,
  statusFilter = 'Available',
  placeholder = 'Search assets…',
  className,
}: AssetSelectorProps) {
  const [search, setSearch] = useState(displayValue ?? '');
  const [open, setOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: assets = [] } = useQuery({
    queryKey: ['assets', 'combobox', debouncedSearch, statusFilter],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Asset[]>>('/api/assets', {
        params: { search: debouncedSearch, status: statusFilter },
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

      {open && assets.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {assets.map((asset) => (
            <li
              key={asset.asset_id}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm hover:bg-gray-50',
                value === asset.asset_id && 'bg-blue-50',
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(asset.asset_id, asset);
                setSearch(asset.asset_name);
                setOpen(false);
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-gray-900">{asset.asset_name}</p>
                  <p className="text-xs text-gray-500">{asset.serial_number}</p>
                </div>
                <AssetStatusBadge status={asset.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
