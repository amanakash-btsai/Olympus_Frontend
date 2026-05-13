import PageHeader from '@/components/layout/PageHeader';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function EQCDashboard() {
  const user = useCurrentUser();

  return (
    <div>
      <PageHeader
        title="EQC Operations Dashboard"
        subtitle={`Welcome, ${user?.name ?? '—'} — EQC Operator view`}
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">EQC Operations Dashboard — under development.</p>
        <p className="mt-1 text-xs text-gray-400">
          This dashboard will show: action queue, assets awaiting inspection/dispatch, pending BOM checks.
        </p>
      </div>
    </div>
  );
}
