import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';

export default function InspectionDetailPage() {
  const { inspection_id } = useParams<{ inspection_id: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title={`Inspection — ${inspection_id}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/inspections')}>Back</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Inspection detail with line-item pass/fail form — under development.</p>
      </div>
    </div>
  );
}
