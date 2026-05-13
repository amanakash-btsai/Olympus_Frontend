import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function CreateSalesRequestPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="New Sales Request"
        actions={
          <Button variant="ghost" onClick={() => navigate('/sales-requests')}>Cancel</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Create Sales Request form — under development.</p>
      </div>
    </div>
  );
}
