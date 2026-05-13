import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';

export default function BOMSetDetailPage() {
  const { set_id } = useParams<{ set_id: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title={`BOM Set — ${set_id}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/bom')}>Back</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">BOM Set detail with line items — under development.</p>
      </div>
    </div>
  );
}
