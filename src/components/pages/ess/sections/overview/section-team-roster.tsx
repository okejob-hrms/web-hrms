'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RosterBulkDialog } from '@/components/shared/shift-roster/roster-bulk-dialog';
import {
  RosterCellDialog,
  type RosterCellTarget,
} from '@/components/shared/shift-roster/roster-cell-dialog';
import { RosterGrid } from '@/components/shared/shift-roster/roster-grid';
import { getErrorMessage, toShiftOptions } from '@/components/shared/shift-roster/utils';
import {
  bulkAssignTeamRoster,
  getTeamRoster,
  getTeamRosterMeta,
  setTeamRosterCell,
} from '@/services/ess/team-roster';

export const SectionTeamRoster = () => {
  const t = useTranslations('ess.teamRoster');
  const qc = useQueryClient();
  const [month, setMonth] = React.useState(dayjs().format('YYYY-MM'));
  const [cellTarget, setCellTarget] = React.useState<RosterCellTarget | null>(null);
  const [bulkOpen, setBulkOpen] = React.useState(false);

  const metaQuery = useQuery({
    queryKey: ['team-roster-meta'],
    queryFn: async () => (await getTeamRosterMeta()).data,
  });
  const hasTeam = Boolean(metaQuery.data?.has_team);

  const rosterQuery = useQuery({
    queryKey: ['team-roster', month],
    queryFn: async () => (await getTeamRoster(month)).data,
    enabled: hasTeam,
  });

  const roster = rosterQuery.data;
  const editableFrom = roster?.editable_from ?? dayjs().format('YYYY-MM-DD');
  const shiftOptions = toShiftOptions(roster?.shifts);
  const onError = async (e: unknown) => toast.error(await getErrorMessage(e, t('saveFailed')));

  const invalidateRoster = () => qc.invalidateQueries({ queryKey: ['team-roster'] });

  const cellMutation = useMutation({
    mutationFn: setTeamRosterCell,
    onSuccess: () => {
      toast.success(t('cellUpdated'));
      setCellTarget(null);
      invalidateRoster();
    },
    onError,
  });

  const bulkMutation = useMutation({
    mutationFn: bulkAssignTeamRoster,
    onSuccess: (res) => {
      toast.success(
        t('bulkDone', { created: res.data?.created ?? 0, conflicts: res.data?.conflicts?.length ?? 0 }),
      );
      setBulkOpen(false);
      invalidateRoster();
    },
    onError,
  });

  if (metaQuery.isLoading) {
    return <div className="py-6 text-sm text-text-secondary">{t('loading')}</div>;
  }

  if (!hasTeam) {
    return (
      <div className="py-6">
        <div className="rounded-md border bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="mt-2 text-sm text-text-secondary">{t('noTeam')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex flex-col gap-4 rounded-md border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-text-secondary">
            {t('subtitle', { count: metaQuery.data?.team_size ?? 0 })}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2 sm:w-60">
            <Label>{t('month')}</Label>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <Button onClick={() => setBulkOpen(true)}>{t('bulkAssign')}</Button>
        </div>
        <p className="text-xs text-text-secondary">{t('pastLocked', { date: editableFrom })}</p>
        {rosterQuery.isError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {t('loadFailed')}
          </div>
        ) : null}
        <RosterGrid
          calendar={roster}
          isCellEditable={(date) => !dayjs(date).isBefore(dayjs(editableFrom), 'day')}
          onCellClick={(employee, date, cells) =>
            setCellTarget({
              employeeId: employee.id,
              employeeName: employee.name ?? String(employee.id),
              date,
              cells,
            })
          }
        />
      </div>

      <RosterCellDialog
        target={cellTarget}
        shiftOptions={shiftOptions}
        isPending={cellMutation.isPending}
        onClose={() => setCellTarget(null)}
        onSubmit={(payload) => cellMutation.mutate(payload)}
      />

      <RosterBulkDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        employees={roster?.employees ?? []}
        shiftOptions={shiftOptions}
        isPending={bulkMutation.isPending}
        month={month}
        minDate={editableFrom}
        onSubmit={(payload) => bulkMutation.mutate(payload)}
      />
    </div>
  );
};
