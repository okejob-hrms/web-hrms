'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Clock, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

import {
  getEssLeaveBalance,
  getEssLeaves,
  essLeaveCancel,
} from '@/services/ess';
import type { EssLeaveItem } from '@/services/ess/types';
import { EssApproversProgress } from '@/components/shared/ess-approvers-progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const STATUS_ALL = 'all';

// Status values: 1=pending, 2=approved, 3=rejected, 4=cancelled
function statusBadge(item: EssLeaveItem) {
  if (item.status === 1) {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-50 border-yellow-700 text-yellow-700 flex items-center gap-1"
      >
        <Clock className="w-3 h-3" />
        {item.status_label}
      </Badge>
    );
  }
  if (item.status === 2) {
    return <Badge variant="default">{item.status_label}</Badge>;
  }
  if (item.status === 3) {
    return <Badge variant="destructive">{item.status_label}</Badge>;
  }
  if (item.status === 4) {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-500">
        {item.status_label}
      </Badge>
    );
  }
  return <Badge variant="outline">{item.status_label}</Badge>;
}

export const SectionLeave = () => {
  const t = useTranslations('ess');
  const tAtt = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('status');
  const tSettings = useTranslations('settings');
  const queryClient = useQueryClient();
  const router = useRouter();

  const [statusFilter, setStatusFilter] = React.useState<string>(STATUS_ALL);
  const [page, setPage] = React.useState(1);
  const [cancelTarget, setCancelTarget] = React.useState<EssLeaveItem | null>(null);

  const { data: balances, isLoading: balanceLoading } = useQuery({
    queryKey: ['ess-leave-balance'],
    queryFn: getEssLeaveBalance,
  });

  const { data: leaves, isLoading: leavesLoading } = useQuery({
    queryKey: ['ess-leaves', statusFilter, page],
    queryFn: () =>
      getEssLeaves(
        statusFilter === STATUS_ALL
          ? { per_page: 50, page }
          : { status: Number(statusFilter), per_page: 50, page },
      ),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => essLeaveCancel(id),
    onSuccess: () => {
      toast.success(t('cancelLeaveSuccess'));
      setCancelTarget(null);
      queryClient.invalidateQueries({ queryKey: ['ess-leaves'] });
      queryClient.invalidateQueries({ queryKey: ['ess-leave-balance'] });
    },
    onError: () => {
      toast.error(t('cancelLeaveFailed'));
    },
  });

  const statusTabs = [
    { label: tCommon('all'), value: STATUS_ALL },
    { label: tStatus('pending'), value: '1' },
    { label: tStatus('approved'), value: '2' },
    { label: tStatus('rejected'), value: '3' },
    { label: tStatus('cancelled'), value: '4' },
  ];

  const rows = leaves?.data ?? [];
  const pagination = leaves?.pagination;
  const hasPrevPage = !!pagination && pagination.current_page > 1;
  const hasNextPage =
    !!pagination &&
    (pagination.next != null || pagination.current_page < pagination.last_page);

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6 md:px-12">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-xl text-primary">{tAtt('leaveRequest')}</h2>
        <Button
          size="sm"
          onClick={() => router.push('/ess/leave/leave-form')}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          {tAtt('newLeaveRequest')}
        </Button>
      </div>

      {/* Leave Balance */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {tSettings('leaveBalance')}
        </h3>
        {balanceLoading ? (
          <div className="flex gap-3">
            <Skeleton className="h-20 w-32" />
            <Skeleton className="h-20 w-32" />
          </div>
        ) : (balances?.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{tCommon('noData')}</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {(balances?.data ?? []).map((b) => (
              <div
                key={b.leave_type_id}
                className="rounded-lg border bg-white p-3 min-w-[140px] space-y-1"
              >
                <div className="text-xs text-muted-foreground font-medium">
                  {b.leave_type_name}
                </div>
                <div className="text-lg font-bold text-primary">
                  {b.remaining}
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                    / {b.balance} {tCommon('day')}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {tAtt('usedLeaveBalance')}: {b.used}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Tabs */}
      <Tabs
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        className="w-full"
      >
        <TabsList className="w-full bg-secondary-background flex overflow-x-auto">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex-1 data-[state=active]:bg-primary data-[state=active]:text-white',
              )}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Leave list */}
      {leavesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tCommon('noData')}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-white space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {item.leave_type?.name ?? tAtt('leaveType')}
                  </span>
                  {statusBadge(item)}
                </div>
                {/* Cancel button only for pending (status 1) */}
                {item.status === 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500"
                    onClick={() => setCancelTarget(item)}
                  >
                    <X className="w-3 h-3 mr-1" /> {tCommon('cancel')}
                  </Button>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.start_date} – {item.end_date}
                <span className="ml-2">
                  ({item.duration} {tCommon('day')})
                </span>
              </div>
              {item.reason && (
                <div className="text-xs text-muted-foreground">{item.reason}</div>
              )}
              {item.approvers && item.approvers.length > 0 && (
                <EssApproversProgress
                  approvers={item.approvers}
                  title={tAtt('approvers')}
                  className="pt-1"
                />
              )}
            </div>
          ))}
          {pagination && (hasPrevPage || hasNextPage) && (
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> {tCommon('previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                {tCommon('next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Cancel confirmation */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null);
        }}
      >
        <AlertDialogContent className="bg-white max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cancelLeaveConfirm')}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelMutation.isPending}
              className="bg-red-500 hover:bg-red-600"
              onClick={(e) => {
                e.preventDefault();
                if (cancelTarget) cancelMutation.mutate(cancelTarget.id);
              }}
            >
              {cancelMutation.isPending ? tCommon('processing') : tCommon('yes')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
