'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Clock, CircleX, ClockCheck } from 'lucide-react';
import {
  essLeaveAction,
  essOvertimeStatus,
  getWaitingDashboardEmployee,
} from '@/services/ess';
import type { WaitingApprovalItem } from '@/services/ess/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function EssApprovalsList() {
  const t = useTranslations('ess');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('status');
  const tSidebar = useTranslations('sidebar');
  const queryClient = useQueryClient();

  const [selected, setSelected] = React.useState<WaitingApprovalItem | null>(
    null,
  );
  const [notes, setNotes] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['waitingStat'],
    queryFn: () => getWaitingDashboardEmployee(),
  });

  const items = React.useMemo(() => {
    const leaves = data?.data.leaves ?? [];
    const overtimes = data?.data.overtimes ?? [];
    return [...leaves, ...overtimes];
  }, [data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['waitingStat'] });
  };

  const leaveMutation = useMutation({
    mutationFn: ({
      id,
      action,
      notes,
    }: {
      id: number;
      action: 'approve' | 'reject';
      notes?: string;
    }) => essLeaveAction(id, { action, notes }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.action === 'approve'
          ? t('approvalsApproveSuccess')
          : t('approvalsRejectSuccess'),
      );
      setSelected(null);
      setNotes('');
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('approvalsActionFailed'));
    },
  });

  const overtimeMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 2 | 3 }) =>
      essOvertimeStatus(id, { status }),
    onSuccess: (_, vars) => {
      toast.success(
        vars.status === 2
          ? t('approvalsApproveSuccess')
          : t('approvalsRejectSuccess'),
      );
      setSelected(null);
      setNotes('');
      invalidate();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('approvalsActionFailed'));
    },
  });

  const isSubmitting = leaveMutation.isPending || overtimeMutation.isPending;

  const handleApprove = () => {
    if (!selected) return;
    if (selected.type === 'leave') {
      leaveMutation.mutate({
        id: selected.id,
        action: 'approve',
        notes: notes.trim() || undefined,
      });
    } else {
      overtimeMutation.mutate({ id: selected.id, status: 2 });
    }
  };

  const handleReject = () => {
    if (!selected) return;
    if (selected.type === 'leave') {
      leaveMutation.mutate({
        id: selected.id,
        action: 'reject',
        notes: notes.trim() || undefined,
      });
    } else {
      overtimeMutation.mutate({ id: selected.id, status: 3 });
    }
  };

  const typeLabel = (item: WaitingApprovalItem) =>
    item.type === 'leave'
      ? tSidebar('leaveRequest')
      : tSidebar('overtimeRequest');

  const subtitle = (item: WaitingApprovalItem) => {
    if (item.type === 'leave') {
      const parts = [
        item.leave_type?.name,
        item.start_date && item.end_date
          ? `${item.start_date} – ${item.end_date}`
          : null,
      ].filter(Boolean);
      return parts.join(' · ');
    }
    const parts = [
      item.overtime_date,
      item.start_time && item.end_time
        ? `${item.start_time} – ${item.end_time}`
        : null,
    ].filter(Boolean);
    return parts.join(' · ');
  };

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl text-primary">{t('approvals')}</h2>
        {data?.data.total ? (
          <Badge variant="secondary">{data.data.total}</Badge>
        ) : null}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">{tCommon('loading')}</div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('approvalsEmpty')}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              className="w-full text-left border rounded-lg p-4 space-y-2 hover:bg-muted/40 transition-colors"
              onClick={() => {
                setSelected(item);
                setNotes('');
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-sm text-primary">
                  {typeLabel(item)}
                </p>
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-yellow-50 border-yellow-800 text-yellow-800"
                >
                  <Clock className="w-3 h-3" />{' '}
                  {tStatus('waitingForApproval')}
                </Badge>
              </div>
              <p className="font-semibold">{item.user.name}</p>
              {subtitle(item) ? (
                <p className="text-sm text-muted-foreground">{subtitle(item)}</p>
              ) : null}
            </button>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setNotes('');
          }
        }}
      >
        <AlertDialogContent className="max-w-md bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('approvalsDetail')}</AlertDialogTitle>
          </AlertDialogHeader>
          {selected ? (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-muted-foreground">{t('approvalsType')}</div>
                <div className="font-medium">{typeLabel(selected)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">
                  {t('approvalsEmployee')}
                </div>
                <div className="font-medium">{selected.user.name}</div>
              </div>
              {selected.type === 'leave' ? (
                <>
                  {selected.leave_type?.name ? (
                    <div>
                      <div className="text-muted-foreground">
                        {t('approvalsLeaveType')}
                      </div>
                      <div className="font-medium">
                        {selected.leave_type.name}
                      </div>
                    </div>
                  ) : null}
                  {selected.start_date && selected.end_date ? (
                    <div>
                      <div className="text-muted-foreground">
                        {tCommon('duration')}
                      </div>
                      <div className="font-medium">
                        {selected.start_date} – {selected.end_date}
                      </div>
                    </div>
                  ) : null}
                  {selected.reason ? (
                    <div>
                      <div className="text-muted-foreground">
                        {t('approvalsReason')}
                      </div>
                      <div className="font-medium">{selected.reason}</div>
                    </div>
                  ) : null}
                  <Separator />
                  <div>
                    <div className="text-muted-foreground mb-2">
                      {t('approvalsNotesOptional')}
                    </div>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('approvalsNotesHint')}
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  {selected.overtime_date ? (
                    <div>
                      <div className="text-muted-foreground">
                        {t('approvalsOvertimeDate')}
                      </div>
                      <div className="font-medium">{selected.overtime_date}</div>
                    </div>
                  ) : null}
                  {selected.start_time && selected.end_time ? (
                    <div>
                      <div className="text-muted-foreground">
                        {t('approvalsTime')}
                      </div>
                      <div className="font-medium">
                        {selected.start_time} – {selected.end_time}
                      </div>
                    </div>
                  ) : null}
                  {selected.notes ? (
                    <div>
                      <div className="text-muted-foreground">
                        {tCommon('notes')}
                      </div>
                      <div className="font-medium">{selected.notes}</div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel disabled={isSubmitting}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="outline"
              className="border-red-500 text-red-500"
              disabled={isSubmitting}
              onClick={handleReject}
            >
              <CircleX className="w-4 h-4" />
              {tCommon('reject')}
            </Button>
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(e) => {
                e.preventDefault();
                handleApprove();
              }}
            >
              <ClockCheck className="w-4 h-4" />
              {t('approveRequest')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
