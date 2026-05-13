import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function GenerateDispatchPage() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Generate Dispatch Document"
        actions={
          <Button variant="ghost" onClick={() => navigate('/dispatch')}>Cancel</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Dispatch document generation wizard — under development.</p>
      </div>
    </div>
  );
}
