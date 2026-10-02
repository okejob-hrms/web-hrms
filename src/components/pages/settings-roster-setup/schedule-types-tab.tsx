'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/combobox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage } from '@/components/shared/shift-roster/utils';
import { usePermissionStore } from '@/hooks/use-permission-store';
import {
  applyScheduleTypes,
  clearScheduleTypeOverride,
  getScheduleTypePreview,
  overrideScheduleType,
  type ScheduleType,
  type ScheduleTypeRow,
} from '@/services/roster-setup';

const PAGE_SIZE = 50;

export function ScheduleTypesTab({ enabled }: { enabled: boolean }) {
  const t = useTranslations('settings.rosterSetup');
  const canEdit = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const qc = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [action, setAction] = React.useState('');
  const [limit, setLimit] = React.useState(PAGE_SIZE);
  const [confirmApply, setConfirmApply] = React.useState(false);

  const query = useQuery({
    queryKey: ['schedule-type-preview'],
    queryFn: async () => (await getScheduleTypePreview()).data,
    enabled,
  });

  const onError = async (e: unknown) => toast.error(await getErrorMessage(e, t('saveFailed')));
  const refresh = () => qc.invalidateQueries({ queryKey: ['schedule-type-preview'] });

  const applyMutation = useMutation({
    mutationFn: applyScheduleTypes,
    onSuccess: () => {
      toast.success(t('applied'));
      setConfirmApply(false);
      refresh();
    },
    onError,
  });

  const rowMutation = useMutation({
    mutationFn: async ({ row, type }: { row: ScheduleTypeRow; type: ScheduleType | null }) =>
      type ? overrideScheduleType(row.employee_id, type) : clearScheduleTypeOverride(row.employee_id),
    onSuccess: () => {
      toast.success(t('scheduleTypeSaved'));
      refresh();
    },
    onError,
  });

  const typeLabel = (type: ScheduleType | null) =>
    type === 'roster' ? t('typeRoster') : type === 'fixed' ? t('typeFixed') : '—';

  const rows = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return (query.data?.rows ?? []).filter(
      (row) =>
        (!action || row.action === action) &&
        (!term ||
          (row.name ?? '').toLowerCase().includes(term) ||
          (row.code ?? '').toLowerCase().includes(term) ||
          (row.branch_name ?? '').toLowerCase().includes(term)),
    );
  }, [query.data, search, action]);

  const summary = query.data?.summary;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">{t('scheduleTypesHint')}</p>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Input
            className="w-64"
            placeholder={t('searchEmployee')}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(PAGE_SIZE);
            }}
          />
          <div className="w-56">
            <SearchableSelect
              options={[
                { value: 'change', label: t('actionChange') },
                { value: 'overridden', label: t('actionOverridden') },
                { value: 'keep', label: t('actionKeep') },
              ]}
              value={action}
              placeholder={t('allEmployees')}
              onValueChange={(v) => {
                setAction(String(v ?? ''));
                setLimit(PAGE_SIZE);
              }}
            />
          </div>
        </div>
        {canEdit ? (
          <Button disabled={!summary?.changes || applyMutation.isPending} onClick={() => setConfirmApply(true)}>
            {t('applyDefaults', { count: summary?.changes ?? 0 })}
          </Button>
        ) : null}
      </div>

      {summary ? (
        <p className="text-sm text-text-secondary">
          {t('scheduleTypesSummary', {
            employees: summary.employees,
            changes: summary.changes,
            overridden: summary.overridden,
          })}
        </p>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('employee')}</TableHead>
              <TableHead>{t('branch')}</TableHead>
              <TableHead>{t('currentType')}</TableHead>
              <TableHead>{t('defaultType')}</TableHead>
              {canEdit ? <TableHead className="text-right">{t('actions')}</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary">{t('loading')}</TableCell>
              </TableRow>
            ) : null}
            {query.isError ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-destructive">{t('loadFailed')}</TableCell>
              </TableRow>
            ) : null}
            {query.isSuccess && !rows.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary">{t('noEmployees')}</TableCell>
              </TableRow>
            ) : null}
            {rows.slice(0, limit).map((row) => (
              <TableRow key={row.employee_id}>
                <TableCell>
                  <div className="font-medium">{row.name ?? '—'}</div>
                  <div className="text-xs text-text-secondary">{row.code}</div>
                </TableCell>
                <TableCell>{row.branch_name ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1">
                    {typeLabel(row.current)}
                    {row.overridden ? <Badge variant="outline" className="text-[10px]">{t('setByHr')}</Badge> : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1">
                    {typeLabel(row.proposed)}
                    {row.action === 'change' ? <Badge variant="secondary" className="text-[10px]">{t('willChange')}</Badge> : null}
                  </div>
                </TableCell>
                {canEdit ? (
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {row.current !== 'roster' || !row.overridden ? (
                        <Button size="sm" variant="outline" disabled={rowMutation.isPending}
                          onClick={() => rowMutation.mutate({ row, type: 'roster' })}>
                          {t('setRoster')}
                        </Button>
                      ) : null}
                      {row.current !== 'fixed' || !row.overridden ? (
                        <Button size="sm" variant="outline" disabled={rowMutation.isPending}
                          onClick={() => rowMutation.mutate({ row, type: 'fixed' })}>
                          {t('setFixed')}
                        </Button>
                      ) : null}
                      {row.overridden ? (
                        <Button size="sm" variant="ghost" disabled={rowMutation.isPending}
                          onClick={() => rowMutation.mutate({ row, type: null })}>
                          {t('useDefault')}
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rows.length > limit ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
            {t('showMore', { shown: limit, total: rows.length })}
          </Button>
        </div>
      ) : null}

      <Dialog open={confirmApply} onOpenChange={setConfirmApply}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t('applyTitle')}</DialogTitle>
            <DialogDescription>{t('applyConfirm', { count: summary?.changes ?? 0 })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmApply(false)}>{t('cancel')}</Button>
            <Button disabled={applyMutation.isPending} onClick={() => applyMutation.mutate()}>
              {t('apply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
