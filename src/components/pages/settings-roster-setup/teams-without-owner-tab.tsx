'use client';

import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getRosterTeams } from '@/services/roster-setup';

export function TeamsWithoutOwnerTab({ enabled }: { enabled: boolean }) {
  const t = useTranslations('settings.rosterSetup');
  const tWeek = useTranslations('rosterWeek');

  const query = useQuery({
    queryKey: ['roster-teams', 'without-owner'],
    queryFn: async () => (await getRosterTeams(true)).data ?? [],
    enabled,
  });

  const statusLabel = (status: string) =>
    tWeek.has(`ownerStatus.${status}`) ? tWeek(`ownerStatus.${status}`) : status;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-secondary">{t('withoutOwnerHint')}</p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('teamLead')}</TableHead>
              <TableHead>{t('branch')}</TableHead>
              <TableHead>{t('members')}</TableHead>
              <TableHead>{t('reason')}</TableHead>
              <TableHead>{t('supervisor')}</TableHead>
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
            {query.isSuccess && !query.data.length ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-text-secondary">{t('allTeamsHaveOwner')}</TableCell>
              </TableRow>
            ) : null}
            {query.data?.map((team) => (
              <TableRow key={team.lead.id}>
                <TableCell className="font-medium">{team.lead.name ?? '—'}</TableCell>
                <TableCell>{team.lead.branch_name ?? '—'}</TableCell>
                <TableCell>{team.member_count}</TableCell>
                <TableCell>{statusLabel(team.owner_status)}</TableCell>
                <TableCell>{team.supervisor?.name ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
