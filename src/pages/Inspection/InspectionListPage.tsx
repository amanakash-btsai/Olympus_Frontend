import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function InspectionListPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Inspections"
        actions={
          <Button onClick={() => navigate('/inspections/new')}>New Inspection</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Inspections list — under development.</p>
      </div>
    </div>
  );
}
