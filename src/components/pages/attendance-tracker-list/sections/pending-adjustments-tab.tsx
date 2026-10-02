'use client';

import * as React from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PaginationState } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';

import {
  getAttendanceAdjustmentRequests,
  approveAttendanceAdjustmentRequest,
  rejectAttendanceAdjustmentRequest,
} from '@/services/attendance/adjustment-requests';
import type { AttendanceAdjustmentRequest } from '@/services/attendance/adjustment-requests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search } from 'lucide-react';
import { Can } from '@/components/auth/can';

export const PendingAdjustmentsTab = () => {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('status');
  const queryClient = useQueryClient();

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [search, setSearch] = React.useState('');
  const [confirmAction, setConfirmAction] = React.useState<{
    id: number;
    action: 'approve' | 'reject';
    name: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-adjustment-requests', pagination, search],
    queryFn: () =>
      getAttendanceAdjustmentRequests(pagination, {
        search: search || undefined,
        status: '0', // pending only
      }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['attendance-adjustment-requests'] });
  };

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveAttendanceAdjustmentRequest(id),
    onSuccess: () => {
      toast.success(t('updateStatusSuccess'));
      setConfirmAction(null);
      invalidate();
    },
    onError: () => {
      toast.error(t('updateStatusFailed'));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectAttendanceAdjustmentRequest(id),
    onSuccess: () => {
      toast.success(t('updateStatusSuccess'));
      setConfirmAction(null);
      invalidate();
    },
    onError: () => {
      toast.error(t('updateStatusFailed'));
    },
  });

  const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

  const columns: ColumnDef<AttendanceAdjustmentRequest>[] = [
    {
      accessorKey: 'user.name',
      header: tCommon('name'),
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-sm">{row.original.user?.name ?? '-'}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.user?.employee_code ?? row.original.user?.email ?? ''}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'attendance_date',
      header: tCommon('date'),
      cell: ({ row }) => row.original.attendance_date ?? '-',
    },
    {
      accessorKey: 'clock_in_at',
      header: t('clockInTime'),
      cell: ({ row }) => row.original.clock_in_at ?? '-',
    },
    {
      accessorKey: 'clock_out_at',
      header: t('clockOutTime'),
      cell: ({ row }) => row.original.clock_out_at ?? '-',
    },
    {
      accessorKey: 'shift_name',
      header: t('shift'),
      cell: ({ row }) => row.original.shift_name ?? '-',
    },
    {
      accessorKey: 'notes',
      header: tCommon('notes'),
      cell: ({ row }) => row.original.notes ?? '-',
    },
    {
      accessorKey: 'status_label',
      header: tCommon('status'),
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-yellow-50 border-yellow-700 text-yellow-700">
          {row.original.status_label || tStatus('pending')}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: tCommon('actions'),
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission="time_attendance.attendance_records.approval">
            <Button
              size="sm"
              variant="outline"
              className="border-red-500 text-red-500"
              onClick={() =>
                setConfirmAction({
                  id: row.original.id,
                  action: 'reject',
                  name: row.original.user?.name ?? String(row.original.id),
                })
              }
            >
              <X className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              onClick={() =>
                setConfirmAction({
                  id: row.original.id,
                  action: 'approve',
                  name: row.original.user?.name ?? String(row.original.id),
                })
              }
            >
              <Check className="w-3 h-3" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          className="w-full md:w-1/3"
          placeholder={t('searchEmployee')}
          icon={<Search className="size-5 text-grayscale-20" />}
          iconPosition="right"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPagination((prev) => ({ ...prev, pageIndex: 0 }));
          }}
        />
      </div>

      <div className="rounded-md bg-white border shadow-sm border-gray-200 p-6">
        <h2 className="font-semibold text-xl mb-4">{t('pendingAdjustments')}</h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            pagination={
              data?.pagination
                ? {
                    current_page: data.pagination.current_page,
                    last_page: data.pagination.last_page,
                    per_page: data.pagination.per_page,
                    total: data.pagination.total,
                    data: data.data,
                    from: (data.pagination.current_page - 1) * data.pagination.per_page + 1,
                    to: Math.min(
                      data.pagination.current_page * data.pagination.per_page,
                      data.pagination.total,
                    ),
                    next_page_url: data.pagination.next,
                    prev_page_url: data.pagination.prev,
                  }
                : undefined
            }
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        )}
      </div>

      {/* Confirm dialog */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
      >
        <AlertDialogContent className="bg-white max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === 'approve'
                ? t('approveAttendance')
                : t('rejectAttendance')}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-muted-foreground px-6">
            {confirmAction?.name}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSubmitting}
              className={
                confirmAction?.action === 'reject'
                  ? 'bg-red-500 hover:bg-red-600'
                  : undefined
              }
              onClick={(e) => {
                e.preventDefault();
                if (!confirmAction) return;
                if (confirmAction.action === 'approve') {
                  approveMutation.mutate(confirmAction.id);
                } else {
                  rejectMutation.mutate(confirmAction.id);
                }
              }}
            >
              {isSubmitting
                ? tCommon('processing')
                : confirmAction?.action === 'approve'
                ? tCommon('approve')
                : tCommon('reject')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
