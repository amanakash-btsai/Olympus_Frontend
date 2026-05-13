import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface TimelineNode {
  status: string;
  timestamp: string;
  actorName?: string;
  notes?: string;
  isCurrent?: boolean;
  subNodes?: Omit<TimelineNode, 'isCurrent' | 'subNodes'>[];
}

interface StatusTimelineProps {
  nodes: TimelineNode[];
  className?: string;
}

export default function StatusTimeline({ nodes, className }: StatusTimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {nodes.map((node, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white',
                node.isCurrent
                  ? 'border-blue-500 ring-4 ring-blue-100'
                  : 'border-gray-300',
              )}
            >
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  node.isCurrent ? 'bg-blue-500' : 'bg-gray-400',
                )}
              />
            </div>
            {i < nodes.length - 1 && (
              <div className="mt-1 w-0.5 flex-1 bg-gray-200 min-h-[2rem]" />
            )}
          </div>

          <div className="pb-8 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={cn(
                  'text-sm font-semibold',
                  node.isCurrent ? 'text-blue-700' : 'text-gray-900',
                )}
              >
                {node.status.replace(/_/g, ' ')}
              </p>
              {node.isCurrent && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Current
                </span>
              )}
            </div>

            <p className="mt-0.5 text-xs text-gray-500">
              {format(new Date(node.timestamp), 'dd MMM yyyy, HH:mm')}
              {node.actorName && (
                <span className="ml-1">· {node.actorName}</span>
              )}
            </p>

            {node.notes && (
              <p className="mt-1 text-xs text-gray-600">{node.notes}</p>
            )}

            {node.subNodes && node.subNodes.length > 0 && (
              <div className="mt-3 ml-2 border-l-2 border-gray-100 pl-4 space-y-3">
                {node.subNodes.map((sub, j) => (
                  <div key={j}>
                    <p className="text-xs font-medium text-gray-700">
                      {sub.status.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(sub.timestamp), 'dd MMM yyyy, HH:mm')}
                      {sub.actorName && <span className="ml-1">· {sub.actorName}</span>}
                    </p>
                    {sub.notes && (
                      <p className="text-xs text-gray-600">{sub.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
