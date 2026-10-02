'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchableSelect } from '@/components/ui/combobox';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage, toShiftOptions } from '@/components/shared/shift-roster/utils';
import { usePermissionStore } from '@/hooks/use-permission-store';
import { getRosterSettings, updateRosterSettings, type RosterSettings } from '@/services/roster-setup';

type BranchDraft = RosterSettings['branches'][number];

export function RosterSettingsTab() {
  const t = useTranslations('settings.rosterSetup');
  const canEdit = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['roster-settings'],
    queryFn: async () => (await getRosterSettings()).data,
  });

  const [leads, setLeads] = React.useState<number[]>([]);
  const [owners, setOwners] = React.useState<number[]>([]);
  const [branches, setBranches] = React.useState<BranchDraft[]>([]);

  React.useEffect(() => {
    if (!query.data) return;
    setLeads(query.data.team_lead_job_level_ids);
    setOwners(query.data.owner_job_level_ids);
    setBranches(query.data.branches);
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateRosterSettings({
        team_lead_job_level_ids: leads,
        owner_job_level_ids: owners,
        branches: branches.map((b) => ({
          id: b.id,
          uses_shift_roster: b.uses_shift_roster,
          default_shift_id: b.default_shift_id,
        })),
      }),
    onSuccess: (res) => {
      toast.success(t('settingsSaved'));
      qc.setQueryData(['roster-settings'], res.data);
      qc.invalidateQueries({ queryKey: ['roster-teams'] });
      qc.invalidateQueries({ queryKey: ['schedule-type-preview'] });
    },
    onError: async (e) => toast.error(await getErrorMessage(e, t('saveFailed'))),
  });

  const toggle = (list: number[], id: number, on: boolean) =>
    on ? Array.from(new Set([...list, id])) : list.filter((x) => x !== id);

  const updateBranch = (id: number, patch: Partial<BranchDraft>) =>
    setBranches((rows) => rows.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  if (query.isLoading) return <p className="text-sm text-text-secondary">{t('loading')}</p>;
  if (query.isError || !query.data) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        {t('loadFailed')}
      </div>
    );
  }

  const shiftOptions = toShiftOptions(query.data.shifts);

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-2">
        <h3 className="font-medium">{t('jobLevelsTitle')}</h3>
        <p className="text-sm text-text-secondary">{t('jobLevelsHint')}</p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('jobLevel')}</TableHead>
                <TableHead className="text-center">{t('teamLead')}</TableHead>
                <TableHead className="text-center">{t('rosterOwner')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.job_levels.map((level) => (
                <TableRow key={level.id}>
                  <TableCell>{level.name}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={leads.includes(level.id)}
                      disabled={!canEdit || owners.includes(level.id)}
                      aria-label={`${t('teamLead')} ${level.name}`}
                      onCheckedChange={(v) => setLeads((l) => toggle(l, level.id, v === true))}
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={owners.includes(level.id)}
                      disabled={!canEdit || leads.includes(level.id)}
                      aria-label={`${t('rosterOwner')} ${level.name}`}
                      onCheckedChange={(v) => setOwners((o) => toggle(o, level.id, v === true))}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="font-medium">{t('branchesTitle')}</h3>
        <p className="text-sm text-text-secondary">{t('branchesHint')}</p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('branch')}</TableHead>
                <TableHead className="text-center">{t('usesRoster')}</TableHead>
                <TableHead>{t('defaultShift')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={branch.uses_shift_roster}
                      disabled={!canEdit}
                      aria-label={`${t('usesRoster')} ${branch.name}`}
                      onCheckedChange={(v) => updateBranch(branch.id, { uses_shift_roster: v })}
                    />
                  </TableCell>
                  <TableCell className="w-64">
                    <SearchableSelect
                      options={shiftOptions}
                      value={branch.default_shift_id ? String(branch.default_shift_id) : ''}
                      placeholder={t('noDefaultShift')}
                      disabled={!canEdit}
                      onValueChange={(v) => updateBranch(branch.id, { default_shift_id: v ? Number(v) : null })}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {canEdit ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          <p className="text-xs text-text-secondary">{t('applyHint')}</p>
          <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {t('save')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
