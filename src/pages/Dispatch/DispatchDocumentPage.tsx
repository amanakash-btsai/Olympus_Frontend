import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { useNavigate, useParams } from 'react-router-dom';

export default function DispatchDocumentPage() {
  const { doc_id } = useParams<{ doc_id: string }>();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title={`Dispatch Document — ${doc_id}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/dispatch')}>Back</Button>
        }
      />
      <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-sm text-gray-500">Dispatch document detail — under development.</p>
      </div>
    </div>
  );
}
