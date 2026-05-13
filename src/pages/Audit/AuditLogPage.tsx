import PageHeader from '@/components/layout/PageHeader';

export default function AuditLogPage() {
  return (
    <div>
      <PageHeader title="Audit Log" subtitle="System event log viewer" />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Audit Log — under development.</p>
      </div>
    </div>
  );
}
