import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function SalesRequestListPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Sales Requests"
        actions={
          <Button onClick={() => navigate('/sales-requests/new')}>New Request</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Sales Requests list — under development.</p>
      </div>
    </div>
  );
}
