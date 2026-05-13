import PageHeader from '@/components/layout/PageHeader';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function ExecutiveDashboard() {
  const user = useCurrentUser();

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        subtitle={`Welcome, ${user?.name ?? '—'} — Executive view`}
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Executive Dashboard — under development.</p>
        <p className="mt-1 text-xs text-gray-400">
          This dashboard will show: KPI trends, AI narrative summary, revenue metrics, utilisation rates.
        </p>
      </div>
    </div>
  );
}
