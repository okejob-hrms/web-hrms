'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface EssApproverProgressItem {
  id?: number;
  status: number;
  status_label?: string;
  notes?: string | null;
  user?: {
    id?: number;
    name?: string | null;
    email?: string | null;
  } | null;
}

function statusBadge(status: number, label?: string) {
  const text = label ?? String(status);
  if (status === 1) {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-50 border-yellow-700 text-yellow-700"
      >
        {text}
      </Badge>
    );
  }
  if (status === 2) {
    return <Badge variant="default">{text}</Badge>;
  }
  if (status === 3) {
    return <Badge variant="destructive">{text}</Badge>;
  }
  if (status === 4) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-500">
        {text}
      </Badge>
    );
  }
  return <Badge variant="outline">{text}</Badge>;
}

interface Props {
  approvers?: EssApproverProgressItem[] | null;
  className?: string;
  title?: string;
}

/**
 * Parallel multi-approver progress (not sequential steps).
 */
export function EssApproversProgress({
  approvers,
  className,
  title = 'Approvers',
}: Props) {
  if (!approvers || approvers.length === 0) {
    return null;
  }

  const active = approvers.filter((a) => a.status !== 4);
  const approvedCount = active.filter((a) => a.status === 2).length;
  const total = active.length || approvers.length;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm text-gray-500">{title}</div>
        {total > 1 && (
          <div className="text-xs text-muted-foreground">
            {approvedCount}/{total} approved
          </div>
        )}
      </div>
      <ul className="space-y-2">
        {approvers.map((approver, index) => (
          <li
            key={approver.id ?? `${approver.user?.id ?? 'a'}-${index}`}
            className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
          >
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {approver.user?.name ?? '-'}
              </div>
              {approver.user?.email && (
                <div className="text-xs text-muted-foreground truncate">
                  {approver.user.email}
                </div>
              )}
            </div>
            {statusBadge(approver.status, approver.status_label)}
          </li>
        ))}
      </ul>
    </div>
  );
}
