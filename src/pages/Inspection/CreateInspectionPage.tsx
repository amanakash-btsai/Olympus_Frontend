import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function CreateInspectionPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="New Inspection"
        actions={
          <Button variant="ghost" onClick={() => navigate('/inspections')}>Cancel</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Create Inspection form — under development.</p>
      </div>
    </div>
  );
}
