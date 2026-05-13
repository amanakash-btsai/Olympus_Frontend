import PageHeader from '@/components/layout/PageHeader';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function InventoryDashboard() {
  const user = useCurrentUser();

  return (
    <div>
      <PageHeader
        title="Inventory Dashboard"
        subtitle={`Welcome, ${user?.name ?? '—'} — Inventory view`}
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Inventory Dashboard — under development.</p>
        <p className="mt-1 text-xs text-gray-400">
          This dashboard will show: asset inventory counts by status, warehouse locations, stock availability.
        </p>
      </div>
    </div>
  );
}
