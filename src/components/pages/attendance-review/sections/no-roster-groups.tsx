'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { formatPeriodDate } from '@/lib/payroll-period';
import { resolveLocale } from '@/lib/i18n/locale';
import type { UnresolvedNoRosterGroup } from '@/services/attendance-review/types';
import { rosterWeekHref } from './roster-hint';

interface NoRosterGroupsProps {
  groups: UnresolvedNoRosterGroup[];
}

export function NoRosterGroups({ groups }: NoRosterGroupsProps) {
  const t = useTranslations('attendanceReview');
  const locale = resolveLocale(useLocale());

  if (groups.length === 0) return null;

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div className="mb-2 font-medium">{t('noRosterGroupsTitle')}</div>
      <ul className="flex flex-col gap-1.5">
        {groups.map((group) => (
          <li key={`${group.branch_id ?? 'x'}|${group.week_start}`} className="flex flex-wrap items-center gap-2">
            <span>
              {t('noRosterGroupLine', {
                branch: group.branch || t('noEmployee'),
                date: formatPeriodDate(group.week_start, locale),
                count: group.punch_count,
              })}
            </span>
            <Link
              href={rosterWeekHref(group.week_start)}
              className="inline-flex items-center gap-1 font-medium underline"
            >
              {t('openShiftRoster')}
              <ExternalLink className="size-3.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
