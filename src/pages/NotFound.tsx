import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 mb-4">
        <FileQuestion className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">404 - Page Not Found</h1>
      <p className="mt-1 text-xs text-gray-500 max-w-sm">
        The requested resource, ticket, or management URL does not exist or has been relocated.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
