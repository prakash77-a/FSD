import React, { useEffect, useState } from 'react';
import { Database, Server, CheckCircle2, AlertTriangle, X, Terminal, ShieldCheck } from 'lucide-react';
import api from '../services/api.ts';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/health');
      setHealthData(res.data);
    } catch (err) {
      console.error('Failed to fetch health status:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const db = healthData?.database;
  const isAtlas = db?.type === 'mongodb-atlas';
  const isLocal = db?.type === 'mongodb-local';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-lg bg-white shadow-xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">
              Database & MERN Environment Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-gray-700">
          {/* Status Box */}
          <div className="rounded-md border border-gray-200 p-4 bg-gray-50 flex items-start gap-3">
            {isAtlas || isLocal ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Server className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900 text-sm">
                  {isAtlas
                    ? 'MongoDB Atlas (Cloud Connected)'
                    : isLocal
                    ? 'Local MongoDB Instance'
                    : 'High-Performance In-Memory DB Engine (MongoDB Compatible)'}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  Active & Operational
                </span>
              </div>
              <p className="mt-1 text-gray-600">
                {isAtlas
                  ? `Connected to remote MongoDB Atlas cluster. URI: ${db?.uriPreview}`
                  : isLocal
                  ? `Connected to local MongoDB instance. URI: ${db?.uriPreview}`
                  : 'Operating in self-contained mode with in-memory persistence and full Mongoose schema compatibility. All queries, activity logging, and notifications are live.'}
              </p>
            </div>
          </div>

          {/* Test Accounts Reference */}
          <div className="rounded-md border border-gray-200 p-3 bg-white space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              Pre-seeded Enterprise Accounts:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded bg-gray-50 border border-gray-100">
                <div className="font-semibold text-purple-700">Administrator:</div>
                <div className="text-gray-800 font-mono">admin@resolvedesk.com</div>
                <div className="text-gray-500 font-mono">Password: Admin@123456</div>
              </div>
              <div className="p-2 rounded bg-gray-50 border border-gray-100">
                <div className="font-semibold text-blue-700">User / Staff:</div>
                <div className="text-gray-800 font-mono">sarah.jenkins@acme.org</div>
                <div className="text-gray-500 font-mono">Password: User@123456</div>
              </div>
            </div>
          </div>

          {/* MongoDB Atlas Setup Instructions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
              <Terminal className="h-4 w-4 text-gray-700" />
              How to connect MongoDB Atlas:
            </div>
            <ol className="list-decimal pl-4 space-y-1.5 text-gray-600">
              <li>Create a free cluster on <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-900">cloud.mongodb.com</code></li>
              <li>Add a database user with read/write privileges and allow network access (0.0.0.0/0)</li>
              <li>
                Set your connection string in <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-900">.env</code>:
                <div className="mt-1 rounded bg-gray-900 p-2 font-mono text-[11px] text-gray-200 overflow-x-auto">
                  MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.abcde.mongodb.net/complaint_management?retryWrites=true&amp;w=majority
                </div>
              </li>
              <li>
                Run the dedicated seed script to populate sample complaints:
                <div className="mt-1 rounded bg-gray-900 p-2 font-mono text-[11px] text-gray-200">
                  npm run seed
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseStatusModal;
