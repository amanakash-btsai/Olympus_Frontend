import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function DispatchListPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Dispatch"
        actions={
          <Button onClick={() => navigate('/dispatch/generate')}>Generate Dispatch</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Dispatch documents list — under development.</p>
      </div>
    </div>
  );
}
