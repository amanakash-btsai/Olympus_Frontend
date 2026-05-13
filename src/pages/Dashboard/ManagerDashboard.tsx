import PageHeader from '@/components/layout/PageHeader';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function ManagerDashboard() {
  const user = useCurrentUser();

  return (
    <div>
      <PageHeader
        title="Manager Dashboard"
        subtitle={`Welcome, ${user?.name ?? '—'} — Manager view`}
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Manager Dashboard — under development.</p>
        <p className="mt-1 text-xs text-gray-400">
          This dashboard will show: overdue asset feed, approval queue, team KPIs, escalations.
        </p>
      </div>
    </div>
  );
}
