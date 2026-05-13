import PageHeader from '@/components/layout/PageHeader';

const REPORT_TYPES = [
  { key: 'asset-utilisation', label: 'Asset Utilisation', description: 'Asset usage and deployment rates over time.' },
  { key: 'bom-compliance', label: 'BOM Compliance', description: 'Missing accessory rates per model code.' },
  { key: 'inspection-defects', label: 'Inspection Defects', description: 'Defect rates and common failure items.' },
  { key: 'loaner-billing', label: 'Loaner Billing', description: 'Rental revenue and billing summaries.' },
  { key: 'overdue-analysis', label: 'Overdue Analysis', description: 'Assets and requests past expected return date.' },
  { key: 'repair-case-summary', label: 'Repair Case Summary', description: 'Repair case volumes, costs, and turnaround.' },
  { key: 'sales-request-summary', label: 'Sales Request Summary', description: 'Request pipeline and completion rates.' },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" subtitle="Select a report type to generate" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_TYPES.map((r) => (
          <div
            key={r.key}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm opacity-60 cursor-not-allowed"
          >
            <h3 className="text-sm font-semibold text-gray-900">{r.label}</h3>
            <p className="mt-1 text-xs text-gray-500">{r.description}</p>
            <span className="mt-3 inline-block text-xs text-gray-400">Under development</span>
          </div>
        ))}
      </div>
    </div>
  );
}
