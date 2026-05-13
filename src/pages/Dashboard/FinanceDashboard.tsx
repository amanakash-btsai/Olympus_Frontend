import PageHeader from '@/components/layout/PageHeader';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function FinanceDashboard() {
  const user = useCurrentUser();

  return (
    <div>
      <PageHeader
        title="Finance Dashboard"
        subtitle={`Welcome, ${user?.name ?? '—'} — Finance view`}
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Finance Dashboard — under development.</p>
        <p className="mt-1 text-xs text-gray-400">
          This dashboard will show: billing summaries, rental revenue, repair costs, loaner billing.
        </p>
      </div>
    </div>
  );
}
