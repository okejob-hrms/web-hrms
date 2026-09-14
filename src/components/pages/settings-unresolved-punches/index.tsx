'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { HTTPError } from 'ky';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/combobox';
import { BasicDatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Can } from '@/components/auth/can';
import type { ApiErrorResponse } from '@/lib/types';
import { getBranches, getShift } from '@/services/settings';
import {
  assignUnresolvedPunch,
  discardUnresolvedPunch,
  getUnresolvedPunches,
  type UnresolvedPunch,
} from '@/services/shift-roster';

async function getErrorMessage(error: unknown, fallback: string): Promise<string> {
  if (error instanceof HTTPError) {
    try {
      const errorData = (await error.response.json()) as ApiErrorResponse;
      if (errorData.message) return errorData.message;
    } catch {
      // fall through
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function dateToStr(d: Date | undefined): string {
  return d ? dayjs(d).format('YYYY-MM-DD') : '';
}

function strToDate(s: string): Date | undefined {
  return s ? dayjs(s).toDate() : undefined;
}

function reasonBadgeVariant(
  reason: string | null | undefined,
): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (reason === 'no_roster') return 'destructive';
  if (reason === 'outside_window') return 'secondary';
  if (reason === 'ambiguous') return 'outline';
  return 'outline';
}

export default function SettingsUnresolvedPunches() {
  const t = useTranslations('settings.unresolvedPunches');
  const qc = useQueryClient();
  const [branchId, setBranchId] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [assignTarget, setAssignTarget] = React.useState<UnresolvedPunch | null>(null);
  const [countedDate, setCountedDate] = React.useState(dayjs().format('YYYY-MM-DD'));
  const [shiftId, setShiftId] = React.useState('');

  const branchesQuery = useQuery({
    queryKey: ['branches', 'unresolved'],
    queryFn: async () => (await getBranches()).data ?? [],
  });

  const shiftsQuery = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => (await getShift()).data ?? [],
  });

  const listQuery = useQuery({
    queryKey: ['unresolved-punches', branchId, reason, from, to, page],
    queryFn: async () =>
      getUnresolvedPunches({
        branch_id: branchId ? Number(branchId) : undefined,
        reason: reason || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
      }),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['unresolved-punches'] });

  const assignMutation = useMutation({
    mutationFn: () =>
      assignUnresolvedPunch(assignTarget!.id, {
        counted_date: countedDate,
        shift_id: Number(shiftId),
      }),
    onSuccess: () => {
      toast.success(t('assigned'));
      setAssignTarget(null);
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('actionFailed'))),
  });

  const discardMutation = useMutation({
    mutationFn: (id: number) => discardUnresolvedPunch(id),
    onSuccess: () => {
      toast.success(t('discarded'));
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('actionFailed'))),
  });

  const rows = listQuery.data?.data ?? [];
  const pagination = listQuery.data?.pagination;

  const reasonLabel = (value: string | null | undefined) => {
    if (value === 'no_roster') return t('reasonNoRoster');
    if (value === 'outside_window') return t('reasonOutsideWindow');
    if (value === 'ambiguous') return t('reasonAmbiguous');
    return value ?? '—';
  };

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div>
        <h2 className="font-semibold text-xl">{t('title')}</h2>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>{t('branch')}</Label>
          <SearchableSelect
            options={[
              { value: '', label: t('allBranches') },
              ...(branchesQuery.data?.map((b) => ({
                value: String(b.id),
                label: b.name,
              })) ?? []),
            ]}
            value={branchId}
            onValueChange={(v) => {
              setBranchId(String(v ?? ''));
              setPage(1);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('reason')}</Label>
          <SearchableSelect
            options={[
              { value: '', label: t('allReasons') },
              { value: 'no_roster', label: t('reasonNoRoster') },
              { value: 'outside_window', label: t('reasonOutsideWindow') },
              { value: 'ambiguous', label: t('reasonAmbiguous') },
            ]}
            value={reason}
            onValueChange={(v) => {
              setReason(String(v ?? ''));
              setPage(1);
            }}
          />
        </div>
        <BasicDatePicker
          label={t('from')}
          value={strToDate(from)}
          onSelect={(d) => {
            setFrom(dateToStr(d));
            setPage(1);
          }}
        />
        <BasicDatePicker
          label={t('to')}
          value={strToDate(to)}
          onSelect={(d) => {
            setTo(dateToStr(d));
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('employee')}</TableHead>
              <TableHead>{t('branch')}</TableHead>
              <TableHead>{t('punchedAt')}</TableHead>
              <TableHead>{t('reason')}</TableHead>
              <TableHead>{t('daysPending')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!rows.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-text-secondary">
                  {t('empty')}
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const daysPending = dayjs().diff(dayjs(row.punched_at), 'day');
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.employee?.user?.name ?? '—'}</div>
                    {row.employee?.code ? (
                      <div className="text-xs text-text-secondary">{row.employee.code}</div>
                    ) : null}
                  </TableCell>
                  <TableCell>{row.employee?.branch?.name ?? '—'}</TableCell>
                  <TableCell>{dayjs(row.punched_at).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell>
                    <Badge variant={reasonBadgeVariant(row.unresolved_reason)}>
                      {reasonLabel(row.unresolved_reason)}
                    </Badge>
                  </TableCell>
                  <TableCell>{Math.max(0, daysPending)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Can permission="time_attendance.attendance_records.approval">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAssignTarget(row);
                            setCountedDate(dayjs(row.punched_at).format('YYYY-MM-DD'));
                            setShiftId('');
                          }}
                        >
                          {t('assign')}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={discardMutation.isPending}
                          onClick={() => discardMutation.mutate(row.id)}
                        >
                          {t('discard')}
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination ? (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            {t('pageOf', {
              page: pagination.current_page,
              last: pagination.last_page,
              total: pagination.total,
            })}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('next')}
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={Boolean(assignTarget)} onOpenChange={(open) => !open && setAssignTarget(null)}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t('assign')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              {assignTarget?.employee?.user?.name} ·{' '}
              {assignTarget ? dayjs(assignTarget.punched_at).format('YYYY-MM-DD HH:mm') : ''}
            </p>
            <BasicDatePicker
              label={t('countedDate')}
              value={strToDate(countedDate)}
              onSelect={(d) => setCountedDate(dateToStr(d) || countedDate)}
            />
            <div className="space-y-2">
              <Label>{t('shift')}</Label>
              <SearchableSelect
                options={
                  shiftsQuery.data?.map((s: { id: number; name: string }) => ({
                    value: String(s.id),
                    label: s.name,
                  })) ?? []
                }
                value={shiftId}
                onValueChange={(v) => setShiftId(String(v ?? ''))}
                placeholder={t('selectShift')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTarget(null)}>
              {t('cancel')}
            </Button>
            <Button
              disabled={!shiftId || assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
