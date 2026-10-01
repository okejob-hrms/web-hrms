'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type {
  RosterMemberDay,
  RosterOverridePayload,
  RosterWeekMember,
  RosterWeekView,
} from '@/services/shift-roster';
import { RosterOverrideDialog, type RosterOverrideTarget } from './roster-override-dialog';
import { toShiftOptions, useLocalDateFormat } from './utils';

type WeekRosterEditorProps = {
  view: RosterWeekView | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Caller-side permission; the week's own `editable` flag is applied on top. */
  canEdit: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  onSetTeam: (koordinatorId: number, shiftId: number | null) => Promise<unknown>;
  onOverride: (target: RosterOverrideTarget, payload: RosterOverridePayload) => Promise<unknown>;
  onPublish: () => Promise<unknown>;
  emptyLabel?: string;
  renderMemberActions?: (member: RosterWeekMember) => React.ReactNode;
};

const sourceClass: Record<RosterMemberDay['source'], string> = {
  team: '',
  week: 'bg-blue-50',
  day: 'bg-amber-50',
};

export function WeekRosterEditor({
  view,
  isLoading,
  isError,
  canEdit,
  isSaving,
  isPublishing,
  onSetTeam,
  onOverride,
  onPublish,
  emptyLabel,
  renderMemberActions,
}: WeekRosterEditorProps) {
  const t = useTranslations('rosterWeek');
  const formatDate = useLocalDateFormat();
  const [target, setTarget] = React.useState<RosterOverrideTarget | null>(null);
  const [confirmPublish, setConfirmPublish] = React.useState(false);
  // Picked team shifts shown until the refetched week replaces them.
  const [pendingTeamShift, setPendingTeamShift] = React.useState<Record<number, number | null>>({});

  React.useEffect(() => setPendingTeamShift({}), [view]);

  const pickTeamShift = (koordinatorId: number, shiftId: number | null) => {
    setPendingTeamShift((p) => ({ ...p, [koordinatorId]: shiftId }));
    onSetTeam(koordinatorId, shiftId).catch(() =>
      setPendingTeamShift(({ [koordinatorId]: _, ...rest }) => rest),
    );
  };

  const editable = canEdit && Boolean(view?.editable) && Boolean(view?.week);
  const isPublished = view?.week?.status === 'published';
  const showActions = editable || Boolean(renderMemberActions);
  const shiftOptions = toShiftOptions(view?.shifts);

  const dayLabel = (day: RosterMemberDay) =>
    day.is_day_off ? t('off') : (day.shift_name ?? '—');

  const openDay = (member: RosterWeekMember, day: RosterMemberDay) =>
    setTarget({
      employeeId: member.employee_id,
      employeeName: member.name ?? String(member.employee_id),
      date: day.date,
      current: day.source === 'day' ? { shift_id: day.shift_id, is_day_off: day.is_day_off } : null,
      effective: { shift_id: day.shift_id, is_day_off: day.is_day_off },
    });

  const openWeek = (member: RosterWeekMember, teamShiftId: number | null) =>
    setTarget({
      employeeId: member.employee_id,
      employeeName: member.name ?? String(member.employee_id),
      current: member.week_override,
      effective: member.week_override ?? { shift_id: teamShiftId, is_day_off: false },
    });

  if (isLoading) {
    return <div className="rounded-md border p-6 text-center text-sm text-text-secondary">{t('loading')}</div>;
  }
  if (isError) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
        {t('loadFailed')}
      </div>
    );
  }
  if (!view?.week || !view.teams.length) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-text-secondary">
        {emptyLabel ?? t('noRoster')}
      </div>
    );
  }

  const week = view.week;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant={isPublished ? 'default' : 'secondary'}>
            {isPublished ? t('statusPublished') : t('statusDraft')}
          </Badge>
          {week.owner_name ? <span className="text-text-secondary">{t('owner', { name: week.owner_name })}</span> : null}
          {isPublished && week.published_at ? (
            <span className="text-text-secondary">
              {t('publishedBy', {
                name: week.published_by_name ?? '—',
                at: dayjs(week.published_at).format('YYYY-MM-DD HH:mm'),
              })}
            </span>
          ) : null}
          {!view.editable ? <span className="text-text-secondary">{t('readOnly')}</span> : null}
        </div>
        {editable && !isPublished ? (
          <Button onClick={() => setConfirmPublish(true)} disabled={isPublishing}>
            {t('publish')}
          </Button>
        ) : null}
      </div>

      {editable && isPublished ? <p className="text-xs text-text-secondary">{t('publishedEditHint')}</p> : null}

      <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border" />{t('legendTeam')}</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border bg-blue-50" />{t('legendWeek')}</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm border bg-amber-50" />{t('legendDay')}</span>
      </div>

      {view.teams.map((team) => {
        const teamShiftId =
          team.koordinator_employee_id in pendingTeamShift
            ? pendingTeamShift[team.koordinator_employee_id]
            : team.shift_id;
        return (
        <div key={team.koordinator_employee_id} className="rounded-md border">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-3">
            <div className="font-medium">{t('team', { name: team.koordinator_name ?? '—' })}</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">{t('teamShift')}</span>
              {editable ? (
                <div className="w-48">
                  <SearchableSelect
                    options={shiftOptions}
                    value={teamShiftId ? String(teamShiftId) : ''}
                    placeholder={t('selectShift')}
                    disabled={isSaving}
                    allowClear={!isPublished}
                    onValueChange={(v) => {
                      const next = v ? Number(v) : null;
                      if (next !== teamShiftId && (next !== null || !isPublished)) {
                        pickTeamShift(team.koordinator_employee_id, next);
                      }
                    }}
                  />
                </div>
              ) : (
                <span className="text-sm font-medium">{team.shift_name ?? '—'}</span>
              )}
            </div>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">{t('member')}</TableHead>
                  {view.days.map((date) => (
                    <TableHead key={date} className="min-w-[96px] text-center text-xs">
                      {formatDate(date, 'ddd')}
                      <div className="font-normal text-text-secondary">{formatDate(date, 'DD MMM')}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.members.map((member) => {
                  const memberEditable = editable && member.rostered;
                  return (
                    <TableRow key={member.employee_id}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1 font-medium">
                          {member.name ?? '—'}
                          {member.is_lead ? <Badge variant="outline" className="text-[10px]">{t('lead')}</Badge> : null}
                          {!member.rostered ? <Badge variant="secondary" className="text-[10px]">{t('fixed')}</Badge> : null}
                        </div>
                        <div className="text-xs text-text-secondary">{member.code}</div>
                        {showActions ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {memberEditable ? (
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => openWeek(member, team.shift_id)}>
                                {t('wholeWeek')}
                              </Button>
                            ) : null}
                            {renderMemberActions?.(member)}
                          </div>
                        ) : null}
                      </TableCell>
                      {member.days.map((day) => (
                        <TableCell
                          key={day.date}
                          className={`text-center text-xs ${member.rostered ? sourceClass[day.source] : 'text-text-secondary'} ${
                            memberEditable ? 'cursor-pointer hover:bg-muted/60' : ''
                          }`}
                          title={member.rostered ? undefined : t('fixedHint')}
                          onClick={() => memberEditable && openDay(member, day)}
                        >
                          {member.rostered ? dayLabel(day) : '·'}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
        );
      })}

      {view.history?.length ? (
        <div className="rounded-md border p-3">
          <div className="mb-2 font-medium">{t('history')}</div>
          <ul className="space-y-2 text-sm">
            {view.history.map((change) => (
              <li key={change.id}>
                <div className="text-xs text-text-secondary">
                  {change.action === 'publish' ? t('historyPublished') : t('historyEdited')} ·{' '}
                  {change.by ?? '—'} · {change.at ? dayjs(change.at).format('YYYY-MM-DD HH:mm') : ''}
                </div>
                <ul className="list-disc pl-5">
                  {change.lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <RosterOverrideDialog
        target={target}
        shiftOptions={shiftOptions}
        isPending={isSaving}
        onClose={() => setTarget(null)}
        onSubmit={(current, payload) => {
          onOverride(current, payload).then(() => setTarget(null), () => undefined);
        }}
      />

      <Dialog open={confirmPublish} onOpenChange={setConfirmPublish}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{t('publishTitle')}</DialogTitle>
            <DialogDescription>{t('publishConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmPublish(false)}>
              {t('cancel')}
            </Button>
            <Button
              disabled={isPublishing}
              onClick={() => {
                onPublish().then(() => setConfirmPublish(false), () => undefined);
              }}
            >
              {t('publish')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
