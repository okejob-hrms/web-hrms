'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Edit3,
  X,
} from 'lucide-react';
import dayjs from 'dayjs';

import { getEssAttendanceHistory, adjustEssAttendance } from '@/services/ess';
import type { EssAttendanceHistory, EssAttendanceAdjustPayload } from '@/services/ess/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const STATUS_ALL = 'all';

/** Normalize API time strings to HH:mm for `<input type="time">`. */
function toTimeInputValue(raw: string | null | undefined): string {
  if (!raw) return '';
  const m = raw.match(/(\d{1,2}):(\d{2})/);
  if (!m) return '';
  return `${m[1].padStart(2, '0')}:${m[2]}`;
}

function statusVariant(status: number): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 1) return 'default';    // approved / on-time
  if (status === 2) return 'destructive'; // rejected
  return 'secondary';
}

export const SectionAttendance = () => {
  const t = useTranslations('ess');
  const tCommon = useTranslations('common');
  const tAtt = useTranslations('attendance');
  const tStatus = useTranslations('status');
  const queryClient = useQueryClient();

  const [period, setPeriod] = React.useState(() => dayjs().format('YYYY-MM'));
  const [statusFilter, setStatusFilter] = React.useState<string>(STATUS_ALL);
  const [page, setPage] = React.useState(1);

  // adjust modal
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<EssAttendanceHistory | null>(null);
  const [form, setForm] = React.useState<EssAttendanceAdjustPayload>({});

  const { data, isLoading } = useQuery({
    queryKey: ['ess-attendance-history', period, statusFilter, page],
    queryFn: () =>
      getEssAttendanceHistory({
        period,
        status: statusFilter === STATUS_ALL ? undefined : statusFilter,
        per_page: 50,
        page,
      }),
  });

  const adjustMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: EssAttendanceAdjustPayload }) =>
      adjustEssAttendance(id, payload),
    onSuccess: () => {
      toast.success(tAtt('updateAttendanceSuccess'));
      setAdjustOpen(false);
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['ess-attendance-history'] });
    },
    onError: () => {
      toast.error(tAtt('updateAttendanceFailed'));
    },
  });

  const handlePrevMonth = () => {
    setPeriod((p) => dayjs(p + '-01').subtract(1, 'month').format('YYYY-MM'));
    setPage(1);
  };
  const handleNextMonth = () => {
    setPeriod((p) => dayjs(p + '-01').add(1, 'month').format('YYYY-MM'));
    setPage(1);
  };

  const openAdjust = (item: EssAttendanceHistory) => {
    setSelected(item);
    setForm({
      clock_in_at: toTimeInputValue(item.clock_in_at),
      clock_out_at: toTimeInputValue(item.clock_out_at),
      notes: item.notes ?? '',
    });
    setAdjustOpen(true);
  };

  const submitAdjust = () => {
    if (!selected) return;
    const clockIn = (form.clock_in_at ?? '').trim();
    const clockOut = (form.clock_out_at ?? '').trim();
    if (!clockIn) {
      toast.error(tAtt('clockInRequired'));
      return;
    }
    if (!clockOut) {
      toast.error(tAtt('clockOutRequired'));
      return;
    }
    if (clockOut <= clockIn) {
      toast.error(tAtt('clockOutAfterClockIn'));
      return;
    }
    adjustMutation.mutate({
      id: selected.id,
      payload: { ...form, clock_in_at: clockIn, clock_out_at: clockOut },
    });
  };

  const statusTabs = [
    { label: tCommon('all'), value: STATUS_ALL },
    { label: tStatus('pending'), value: '0' },
    { label: tStatus('approved'), value: '1' },
    { label: tStatus('rejected'), value: '2' },
  ];

  const rows = data?.data ?? [];
  const pagination = data?.pagination;
  const hasPrevPage = !!pagination && pagination.current_page > 1;
  const hasNextPage =
    !!pagination &&
    (pagination.next != null || pagination.current_page < pagination.last_page);

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6 md:px-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-semibold text-xl text-primary">{t('myAttendance')}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium text-sm min-w-[7rem] text-center">
            {dayjs(period + '-01').format('MMMM YYYY')}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        className="w-full"
      >
        <TabsList className="w-full bg-secondary-background">
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

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
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
              className="border rounded-lg p-4 space-y-2 bg-white relative"
            >
              {item.pending_adjustment && (
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="secondary"
                    className="bg-yellow-50 border-yellow-700 text-yellow-700 flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" /> {tStatus('waiting')}
                  </Badge>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 flex-wrap pr-24">
                <span className="font-semibold text-sm">{item.attendance_date}</span>
                <Badge variant={statusVariant(item.status)}>{item.status_label}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {tAtt('clockIn')}: {item.clock_in_at ?? '-'} &nbsp;·&nbsp;{' '}
                {tAtt('clockOut')}: {item.clock_out_at ?? '-'}
                {item.shift_name && (
                  <span className="ml-2 text-xs">({item.shift_name})</span>
                )}
              </div>
              {item.notes && (
                <div className="text-xs text-muted-foreground">{item.notes}</div>
              )}
              {!item.pending_adjustment && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1"
                  onClick={() => openAdjust(item)}
                >
                  <Edit3 className="w-3 h-3 mr-1" /> {tAtt('editAttendanceRecord')}
                </Button>
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

      {/* Adjust dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{tAtt('editAttendanceRecord')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{tAtt('clockIn')}</label>
              <Input
                type="time"
                value={form.clock_in_at ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, clock_in_at: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">{tAtt('clockOut')}</label>
              <Input
                type="time"
                value={form.clock_out_at ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, clock_out_at: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">{tCommon('notes')}</label>
              <Input
                value={form.notes ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder={t('approvalsNotesHint')}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAdjustOpen(false)}
              disabled={adjustMutation.isPending}
            >
              <X className="w-4 h-4 mr-1" /> {tCommon('cancel')}
            </Button>
            <Button
              disabled={adjustMutation.isPending}
              onClick={submitAdjust}
            >
              {adjustMutation.isPending ? tCommon('saving') : tCommon('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
