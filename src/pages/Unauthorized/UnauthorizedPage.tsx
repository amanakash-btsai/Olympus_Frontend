import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
      <p className="text-6xl font-bold text-amber-500">403</p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white">Access denied</h1>
      <p className="mt-2 text-sm text-gray-500">
        Your account does not have permission to view this page.
      </p>
      <Link
        to="/dashboard"
        className="mt-8 inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
