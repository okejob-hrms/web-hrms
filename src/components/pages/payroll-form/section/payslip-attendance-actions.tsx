'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Can } from '@/components/auth/can';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ApiErrorResponse } from '@/lib/types';
import {
  postMarkAttendanceAbsent,
  putAttendanceStatus,
} from '@/services/attendance';
import type { AttendanceDetail } from '@/services/attendance/types';

const STATUS_APPROVED = 1;
const STATUS_REJECTED = 2;
const STATUS_ABSENT = 3;

type StatusAction = '1' | '2' | '3';

type PayslipAttendanceActionsProps = {
  userId: number;
  date: string;
  attendance: AttendanceDetail | null;
  queryKey: unknown[];
};

async function errorMessage(error: unknown, fallback: string): Promise<string> {
  const response = (error as Error & { response?: Response })?.response;
  if (!response) return fallback;
  try {
    const data: ApiErrorResponse = await response.json();
    const fieldError = data.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;
    return fieldError || data.message || fallback;
  } catch {
    return fallback;
  }
}

function isStatusAction(value: string): value is StatusAction {
  return value === '1' || value === '2' || value === '3';
}

function defaultStatus(options: StatusAction[]): StatusAction {
  if (options.includes('1')) return '1';
  if (options.includes('2')) return '2';
  return '3';
}

export function PayslipAttendanceActions({
  userId,
  date,
  attendance,
  queryKey,
}: PayslipAttendanceActionsProps) {
  const tAtt = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [note, setNote] = React.useState('');

  const status = attendance?.status;
  const attendanceId = attendance?.id;
  const options = React.useMemo((): StatusAction[] => {
    const next: StatusAction[] = [];
    if (Number.isFinite(attendanceId) && status !== STATUS_APPROVED) {
      next.push('1');
    }
    if (Number.isFinite(attendanceId) && status !== STATUS_REJECTED) {
      next.push('2');
    }
    if (status !== STATUS_ABSENT) {
      next.push('3');
    }
    return next;
  }, [attendanceId, status]);

  const [selectedStatus, setSelectedStatus] = React.useState<StatusAction>(
    () => defaultStatus(options),
  );

  const resetForm = React.useCallback(() => {
    setSelectedStatus(defaultStatus(options));
    setNote('');
  }, [options]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
    void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    void queryClient.invalidateQueries({ queryKey: ['payslip'] });
    void queryClient.invalidateQueries({ queryKey: ['detailPayroll'] });
    void queryClient.invalidateQueries({ queryKey: ['detailPayrollSpend'] });
    void queryClient.invalidateQueries({ queryKey: ['payroll'] });
  };

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      nextStatus,
      remarks,
    }: {
      id: number;
      nextStatus: number;
      remarks: string;
    }) => putAttendanceStatus(id, { status: nextStatus, remarks }),
    onSuccess: (_data, variables) => {
      invalidate();
      setOpen(false);
      resetForm();
      toast.success(
        variables.nextStatus === STATUS_ABSENT
          ? tAtt('setAsAbsentSuccess')
          : tAtt('updateStatusSuccess'),
      );
    },
    onError: async (error, variables) => {
      toast.error(
        await errorMessage(
          error,
          variables.nextStatus === STATUS_ABSENT
            ? tAtt('setAsAbsentFailed')
            : tAtt('updateStatusFailed'),
        ),
      );
    },
  });

  const markAbsentMutation = useMutation({
    mutationFn: (remarks: string) =>
      postMarkAttendanceAbsent({
        user_id: userId,
        attendance_date: date,
        remarks,
      }),
    onSuccess: () => {
      invalidate();
      setOpen(false);
      resetForm();
      toast.success(tAtt('setAsAbsentSuccess'));
    },
    onError: async (error) => {
      toast.error(await errorMessage(error, tAtt('setAsAbsentFailed')));
    },
  });

  const pending = statusMutation.isPending || markAbsentMutation.isPending;

  if (options.length === 0) {
    return null;
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const remarks = note.trim();

    switch (selectedStatus) {
      case '1':
      case '2':
        if (!attendanceId) return;
        statusMutation.mutate({
          id: attendanceId,
          nextStatus: Number(selectedStatus),
          remarks,
        });
        return;
      case '3':
        if (attendanceId) {
          statusMutation.mutate({
            id: attendanceId,
            nextStatus: STATUS_ABSENT,
            remarks,
          });
          return;
        }
        markAbsentMutation.mutate(remarks);
        return;
      default: {
        const unexpected: never = selectedStatus;
        return unexpected;
      }
    }
  };

  return (
    <Can permission="time_attendance.attendance_records.approval">
      <Popover
        modal
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) resetForm();
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label={tCommon('actions')}
            disabled={pending}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="z-[80] w-72 p-4"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest('[data-slot="select-content"]')) {
              event.preventDefault();
            }
          }}
          onInteractOutside={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest('[data-slot="select-content"]')) {
              event.preventDefault();
            }
          }}
        >
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label htmlFor={`payslip-att-status-${date}`}>
                {tCommon('status')}
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  if (isStatusAction(value)) setSelectedStatus(value);
                }}
                disabled={pending}
              >
                <SelectTrigger
                  id={`payslip-att-status-${date}`}
                  className="w-full"
                >
                  <SelectValue placeholder={tAtt('selectOption')} />
                </SelectTrigger>
                <SelectContent className="z-[90]">
                  {options.includes('1') ? (
                    <SelectItem value="1">{tAtt('acceptAttendance')}</SelectItem>
                  ) : null}
                  {options.includes('2') ? (
                    <SelectItem value="2">{tCommon('reject')}</SelectItem>
                  ) : null}
                  {options.includes('3') ? (
                    <SelectItem value="3">{tAtt('setAsAbsent')}</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`payslip-att-note-${date}`}>
                {tCommon('notes')}{' '}
                <span className="font-normal text-muted-foreground">
                  {tCommon('optional')}
                </span>
              </Label>
              <Textarea
                id={`payslip-att-note-${date}`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
                disabled={pending}
                maxLength={1000}
              />
            </div>
            <Button type="submit" isLoading={pending} disabled={!selectedStatus}>
              {tCommon('submit')}
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </Can>
  );
}
