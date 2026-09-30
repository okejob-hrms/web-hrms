'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchableSelect } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Can } from '@/components/auth/can';
import { RosterBulkDialog } from '@/components/shared/shift-roster/roster-bulk-dialog';
import {
  RosterCellDialog,
  type RosterCellTarget,
} from '@/components/shared/shift-roster/roster-cell-dialog';
import { RosterGrid } from '@/components/shared/shift-roster/roster-grid';
import { getErrorMessage, toShiftOptions } from '@/components/shared/shift-roster/utils';
import { usePermissionStore } from '@/hooks/use-permission-store';
import { getBranches, getShift } from '@/services/settings';
import {
  bulkAssignRoster,
  getRosterCalendar,
  reresolveRoster,
  setRosterCell,
} from '@/services/shift-roster';

export default function SettingsShiftRoster() {
  const t = useTranslations('settings.shiftRoster');
  const canEdit = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const qc = useQueryClient();

  const [branchId, setBranchId] = React.useState<string>('');
  const [month, setMonth] = React.useState(dayjs().format('YYYY-MM'));
  const [cellTarget, setCellTarget] = React.useState<RosterCellTarget | null>(null);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const branchesQuery = useQuery({
    queryKey: ['branches', 'roster'],
    queryFn: async () => {
      const res = await getBranches();
      return res.data ?? [];
    },
  });

  React.useEffect(() => {
    if (!branchId && branchesQuery.data?.length) {
      setBranchId(String(branchesQuery.data[0].id));
    }
  }, [branchId, branchesQuery.data]);

  const shiftsQuery = useQuery({
    queryKey: ['shifts'],
    queryFn: async () => (await getShift()).data ?? [],
  });

  const calendarQuery = useQuery({
    queryKey: ['shift-roster', branchId, month],
    queryFn: async () => (await getRosterCalendar(Number(branchId), month)).data,
    enabled: Boolean(branchId),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['shift-roster'] });

  const setCellMutation = useMutation({
    mutationFn: setRosterCell,
    onSuccess: () => {
      toast.success(t('cellUpdated'));
      setCellTarget(null);
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const bulkMutation = useMutation({
    mutationFn: bulkAssignRoster,
    onSuccess: (res) => {
      const conflicts = res.data?.conflicts?.length ?? 0;
      toast.success(t('bulkDone', { created: res.data?.created ?? 0, conflicts }));
      setBulkOpen(false);
      invalidate();
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const reresolveMutation = useMutation({
    mutationFn: reresolveRoster,
    onSuccess: () => toast.success(t('reresolveDone')),
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const branchOptions =
    branchesQuery.data?.map((b) => ({
      value: String(b.id),
      label: b.name,
    })) ?? [];

  const shiftOptions = toShiftOptions(shiftsQuery.data as Array<{ id: number; name: string }> | undefined);
  const calendar = calendarQuery.data;

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl">{t('title')}</h2>
          <p className="text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <Can permission="time_attendance.attendance_configuration.edit">
          <Button onClick={() => setBulkOpen(true)}>{t('bulkAssign')}</Button>
        </Can>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>{t('branch')}</Label>
          <SearchableSelect
            options={branchOptions}
            value={branchId}
            onValueChange={(v) => setBranchId(String(v ?? ''))}
            placeholder={t('selectBranch')}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('month')}</Label>
          <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {calendarQuery.isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('loadFailed')}
        </div>
      ) : null}

      <RosterGrid
        calendar={calendar}
        isCellEditable={() => canEdit}
        onCellClick={(employee, date, cells) =>
          setCellTarget({
            employeeId: employee.id,
            employeeName: employee.name ?? String(employee.id),
            date,
            cells,
          })
        }
        renderActions={(employee) => (
          <Can permission="time_attendance.attendance_configuration.edit">
            <Button
              variant="outline"
              size="sm"
              disabled={reresolveMutation.isPending}
              onClick={() =>
                reresolveMutation.mutate({
                  employee_id: employee.id,
                  from: dayjs(month).startOf('month').format('YYYY-MM-DD'),
                  to: dayjs(month).endOf('month').format('YYYY-MM-DD'),
                })
              }
            >
              {t('reresolve')}
            </Button>
          </Can>
        )}
      />

      <RosterCellDialog
        target={cellTarget}
        shiftOptions={shiftOptions}
        isPending={setCellMutation.isPending}
        onClose={() => setCellTarget(null)}
        onSubmit={(payload) => setCellMutation.mutate(payload)}
      />

      <RosterBulkDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        employees={calendar?.employees ?? []}
        shiftOptions={shiftOptions}
        isPending={bulkMutation.isPending}
        month={month}
        onSubmit={(payload) => bulkMutation.mutate(payload)}
      />
    </div>
  );
}
