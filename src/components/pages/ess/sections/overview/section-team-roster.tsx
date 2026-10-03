'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { getErrorMessage } from '@/components/shared/shift-roster/utils';
import { WeekPicker } from '@/components/shared/shift-roster/week-picker';
import { WeekRosterEditor } from '@/components/shared/shift-roster/week-roster-editor';
import type { RosterOverrideTarget } from '@/components/shared/shift-roster/roster-override-dialog';
import type { RosterOverridePayload } from '@/services/shift-roster';
import {
  getTeamRosterMeta,
  getTeamRosterWeek,
  publishTeamRosterWeek,
  setTeamRosterMember,
  setTeamRosterMemberDay,
  setTeamRosterTeam,
} from '@/services/ess/team-roster';

export const SectionTeamRoster = () => {
  const t = useTranslations('ess.teamRoster');
  const tWeek = useTranslations('rosterWeek');
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = React.useState<string | null>(null);

  const metaQuery = useQuery({
    queryKey: ['team-roster-meta'],
    queryFn: async () => (await getTeamRosterMeta()).data,
  });
  const meta = metaQuery.data;
  const isOwner = meta?.role === 'owner';

  React.useEffect(() => {
    if (meta && weekStart === null) {
      // Prefer backend default (current if still draft, else next). Fall back
      // to owner→next / lead→current for older APIs without default_week_start.
      setWeekStart(
        meta.default_week_start ||
          (isOwner ? meta.next_week_start : meta.current_week_start),
      );
    }
  }, [meta, isOwner, weekStart]);

  const weekQuery = useQuery({
    queryKey: ['team-roster-week', weekStart],
    queryFn: async () => (await getTeamRosterWeek(weekStart!)).data,
    enabled: Boolean(meta?.has_team && weekStart),
  });

  const onError = async (e: unknown) => toast.error(await getErrorMessage(e, t('saveFailed')));
  const invalidateWeek = () =>
    qc.invalidateQueries({ queryKey: ['team-roster-week', weekStart] });

  const saveMutation = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      toast.success(tWeek('saved'));
      invalidateWeek();
    },
    onError,
  });

  const publishMutation = useMutation({
    mutationFn: () => publishTeamRosterWeek(weekStart!),
    onSuccess: async () => {
      toast.success(tWeek('published'));
      // Meta carries default_week_start; refresh so the next open advances after publish.
      await Promise.all([
        invalidateWeek(),
        qc.invalidateQueries({ queryKey: ['team-roster-meta'] }),
      ]);
    },
    onError,
  });

  if (metaQuery.isLoading) {
    return <div className="py-6 text-sm text-text-secondary">{t('loading')}</div>;
  }

  if (metaQuery.isError) {
    return <div className="py-6 text-sm text-text-secondary">{t('loadFailed')}</div>;
  }

  if (!meta?.has_team) {
    return (
      <div className="py-6">
        <div className="rounded-md border bg-white p-6 text-center shadow-sm">
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="mt-2 text-sm text-text-secondary">{t('noTeam')}</p>
        </div>
      </div>
    );
  }

  const onOverride = (target: RosterOverrideTarget, payload: RosterOverridePayload) =>
    saveMutation.mutateAsync(() =>
      target.date
        ? setTeamRosterMemberDay(weekStart!, target.employeeId, target.date, payload)
        : setTeamRosterMember(weekStart!, target.employeeId, payload),
    );

  return (
    <div className="flex flex-col gap-4 py-6">
      <div className="flex flex-col gap-4 rounded-md border bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold">{t('title')}</h2>
          <p className="text-sm text-text-secondary">
            {isOwner ? t('subtitleOwner', { count: meta.teams_count }) : t('subtitleLead')}
          </p>
        </div>

        {weekStart ? <WeekPicker weekStart={weekStart} onChange={setWeekStart} /> : null}
        {isOwner && weekQuery.data && !weekQuery.data.editable ? (
          <p className="text-xs text-text-secondary">{t('pastLocked')}</p>
        ) : null}

        <WeekRosterEditor
          view={weekQuery.data}
          isLoading={weekQuery.isLoading}
          isError={weekQuery.isError}
          canEdit={isOwner}
          isSaving={saveMutation.isPending}
          isPublishing={publishMutation.isPending}
          emptyLabel={isOwner ? undefined : t('notPublished')}
          onSetTeam={(koordinatorId, shiftId) =>
            saveMutation.mutateAsync(() => setTeamRosterTeam(weekStart!, koordinatorId, shiftId))
          }
          onOverride={onOverride}
          onPublish={() => publishMutation.mutateAsync()}
        />
      </div>
    </div>
  );
};
