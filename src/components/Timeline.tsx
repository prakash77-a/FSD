import React from 'react';
import {
  FileText,
  UserCheck,
  RefreshCw,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
} from 'lucide-react';

export interface ActivityItem {
  _id: string;
  actorName: string;
  actorRole: 'user' | 'admin';
  action:
    | 'Submitted'
    | 'Status Changed'
    | 'Assigned'
    | 'Internal Note Added'
    | 'Resolved'
    | 'Rejected';
  previousValue?: string;
  newValue?: string;
  note?: string;
  createdAt: string;
}

interface TimelineProps {
  activities: ActivityItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-gray-500">
        No recorded activity history for this complaint.
      </div>
    );
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Submitted':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'Assigned':
        return <UserCheck className="h-4 w-4 text-purple-600" />;
      case 'Status Changed':
        return <RefreshCw className="h-4 w-4 text-amber-600" />;
      case 'Resolved':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-rose-600" />;
      case 'Internal Note Added':
        return <MessageSquare className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const isLast = idx === activities.length - 1;
          return (
            <li key={activity._id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {/* Icon circle */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 border border-gray-200 ring-4 ring-white">
                    {getActionIcon(activity.action)}
                  </div>

                  <div className="min-w-0 flex-1 pt-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {activity.actorName}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-medium uppercase tracking-wider ${
                            activity.actorRole === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {activity.actorRole}
                        </span>
                        <span className="text-gray-500 font-medium">
                          {activity.action}
                        </span>
                      </div>
                      <time className="text-gray-400">
                        {formatDate(activity.createdAt)}
                      </time>
                    </div>

                    {/* Change detail */}
                    {(activity.previousValue || activity.newValue) && (
                      <div className="mt-1 text-xs text-gray-600">
                        {activity.previousValue ? (
                          <span>
                            Changed from{' '}
                            <span className="font-medium text-gray-800">
                              {activity.previousValue}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium text-gray-900">
                              {activity.newValue}
                            </span>
                          </span>
                        ) : (
                          <span>
                            Set to{' '}
                            <span className="font-medium text-gray-900">
                              {activity.newValue}
                            </span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Note */}
                    {activity.note && (
                      <div className="mt-2 rounded-md bg-gray-50 border border-gray-200 p-2.5 text-xs text-gray-700 whitespace-pre-wrap">
                        {activity.note}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Timeline;
