'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getErrorMessage, weekStartOf } from '@/components/shared/shift-roster/utils';
import { WeekPicker } from '@/components/shared/shift-roster/week-picker';
import { WeekRosterEditor } from '@/components/shared/shift-roster/week-roster-editor';
import type { RosterOverrideTarget } from '@/components/shared/shift-roster/roster-override-dialog';
import { usePermissionStore } from '@/hooks/use-permission-store';
import {
  getOwnerRosterWeek,
  getOwnerlessTeamRosterWeek,
  getRosterWeek,
  getRosterWeekIndex,
  publishRosterWeek,
  reresolveRoster,
  setRosterWeekMember,
  setRosterWeekMemberDay,
  setRosterWeekTeam,
  type RosterOverridePayload,
  type RosterWeekStatus,
} from '@/services/shift-roster';

type Selection = { kind: 'owner' | 'team'; id: number; weekId: number | null };

export default function SettingsShiftRoster() {
  const t = useTranslations('settings.shiftRoster');
  const tWeek = useTranslations('rosterWeek');
  const canEdit = usePermissionStore((s) => s.can('time_attendance.attendance_configuration.edit'));
  const qc = useQueryClient();

  const [weekStart, setWeekStart] = React.useState(() => weekStartOf());
  const [selection, setSelection] = React.useState<Selection | null>(null);

  const indexQuery = useQuery({
    queryKey: ['roster-week-index', weekStart],
    queryFn: async () => (await getRosterWeekIndex(weekStart)).data,
  });

  // A week that already exists is read as-is. The creating endpoint runs only from Start, when there is no week yet.
  const weekQuery = useQuery({
    queryKey: ['roster-week', weekStart, selection?.kind, selection?.id, selection?.weekId, canEdit],
    queryFn: async () => {
      if (!selection) return undefined;
      if (selection.weekId) return (await getRosterWeek(selection.weekId)).data;
      if (!canEdit) return undefined;
      return selection.kind === 'owner'
        ? (await getOwnerRosterWeek(weekStart, selection.id)).data
        : (await getOwnerlessTeamRosterWeek(weekStart, selection.id)).data;
    },
    enabled: Boolean(selection && (selection.weekId || canEdit)),
  });

  const weekId = weekQuery.data?.week?.id;

  React.useEffect(() => {
    if (weekId && selection && !selection.weekId) {
      setSelection({ ...selection, weekId });
      qc.invalidateQueries({ queryKey: ['roster-week-index', weekStart] });
    }
  }, [weekId, selection, qc, weekStart]);

  const onError = async (e: unknown) => toast.error(await getErrorMessage(e, t('saveFailed')));
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['roster-week', weekStart] });
    qc.invalidateQueries({ queryKey: ['roster-week-index', weekStart] });
  };

  const saveMutation = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      toast.success(tWeek('saved'));
      invalidate();
    },
    onError,
  });

  const publishMutation = useMutation({
    mutationFn: () => publishRosterWeek(weekId!),
    onSuccess: () => {
      toast.success(tWeek('published'));
      invalidate();
    },
    onError,
  });

  const reresolveMutation = useMutation({
    mutationFn: reresolveRoster,
    onSuccess: () => toast.success(t('reresolveDone')),
    onError,
  });

  const changeWeek = (next: string) => {
    setWeekStart(next);
    setSelection(null);
  };

  const statusBadge = (status: RosterWeekStatus | null) => (
    <Badge variant={status === 'published' ? 'default' : status === 'draft' ? 'secondary' : 'outline'}>
      {status === 'published' ? tWeek('statusPublished') : status === 'draft' ? tWeek('statusDraft') : t('notStarted')}
    </Badge>
  );

  const openButton = (next: Selection) => {
    const active = selection?.kind === next.kind && selection.id === next.id;
    const disabled = !canEdit && !next.weekId;
    return (
      <Button size="sm" variant={active ? 'default' : 'outline'} disabled={disabled} onClick={() => setSelection(next)}>
        {!canEdit ? t('view') : next.weekId ? t('open') : t('start')}
      </Button>
    );
  };

  const index = indexQuery.data;
  const weekEnd = dayjs(weekStart).add(6, 'day').format('YYYY-MM-DD');

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <div>
        <h2 className="font-semibold text-xl">{t('title')}</h2>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      <WeekPicker weekStart={weekStart} onChange={changeWeek} />

      {indexQuery.isError ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {t('loadFailed')}
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('owner')}</TableHead>
              <TableHead>{t('teams')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {indexQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-text-secondary">{tWeek('loading')}</TableCell>
              </TableRow>
            ) : null}
            {index?.owners.map((owner) => (
              <TableRow key={`o-${owner.owner_employee_id}`}>
                <TableCell className="font-medium">{owner.owner_name ?? '—'}</TableCell>
                <TableCell className="text-sm whitespace-normal">
                  {owner.teams.map((team) => `${team.koordinator_name ?? '—'} (${team.members_count})`).join(', ')}
                </TableCell>
                <TableCell>{statusBadge(owner.status)}</TableCell>
                <TableCell className="text-right">
                  {openButton({ kind: 'owner', id: owner.owner_employee_id, weekId: owner.week_id })}
                </TableCell>
              </TableRow>
            ))}
            {index?.teams_without_owner.map((team) => (
              <TableRow key={`t-${team.koordinator_employee_id}`}>
                <TableCell>
                  <div className="font-medium">{t('noOwner')}</div>
                  <div className="text-xs text-text-secondary">
                    {tWeek.has(`ownerStatus.${team.owner_status}`)
                      ? tWeek(`ownerStatus.${team.owner_status}`)
                      : team.owner_status}
                    {team.supervisor_name ? ` · ${team.supervisor_name}` : ''}
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-normal">
                  {team.koordinator_name ?? '—'} ({team.members_count})
                </TableCell>
                <TableCell>{statusBadge(team.status)}</TableCell>
                <TableCell className="text-right">
                  {openButton({ kind: 'team', id: team.koordinator_employee_id, weekId: team.week_id })}
                </TableCell>
              </TableRow>
            ))}
            {index && !index.owners.length && !index.teams_without_owner.length ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-text-secondary">{t('noTeams')}</TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {selection ? (
        <WeekRosterEditor
          view={weekQuery.data}
          isLoading={weekQuery.isLoading}
          isError={weekQuery.isError}
          canEdit={canEdit}
          isSaving={saveMutation.isPending}
          isPublishing={publishMutation.isPending}
          onSetTeam={(koordinatorId, shiftId) =>
            saveMutation.mutateAsync(() => setRosterWeekTeam(weekId!, koordinatorId, shiftId))
          }
          onOverride={(target: RosterOverrideTarget, payload: RosterOverridePayload) =>
            saveMutation.mutateAsync(() =>
              target.date
                ? setRosterWeekMemberDay(weekId!, target.employeeId, target.date, payload)
                : setRosterWeekMember(weekId!, target.employeeId, payload),
            )
          }
          onPublish={() => publishMutation.mutateAsync()}
          renderMemberActions={
            canEdit
              ? (member) =>
                  member.rostered ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      disabled={reresolveMutation.isPending}
                      title={t('reresolveHint')}
                      onClick={() =>
                        reresolveMutation.mutate({ employee_id: member.employee_id, from: weekStart, to: weekEnd })
                      }
                    >
                      {t('reresolve')}
                    </Button>
                  ) : null
              : undefined
          }
        />
      ) : (
        <p className="text-sm text-text-secondary">{t('pickRoster')}</p>
      )}
    </div>
  );
}
