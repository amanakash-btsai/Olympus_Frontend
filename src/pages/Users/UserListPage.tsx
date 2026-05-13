import PageHeader from '@/components/layout/PageHeader';

export default function UserListPage() {
  return (
    <div>
      <PageHeader title="Users" subtitle="System user management" />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">User management — under development.</p>
      </div>
    </div>
  );
}
