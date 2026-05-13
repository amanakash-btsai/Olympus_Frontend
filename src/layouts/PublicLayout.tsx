import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </div>
  );
}
