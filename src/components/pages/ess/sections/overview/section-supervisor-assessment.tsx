'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Calendar, Clock } from 'lucide-react';

import { getEssSupervisorAssessments } from '@/services/ess';
import type { EssSupervisorAssessmentItem } from '@/services/ess/types';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function statusBadge(item: EssSupervisorAssessmentItem) {
  // status 1 = pending/waiting, 2 = approved/done, 3 = rejected
  if (item.status === 1) {
    return (
      <Badge
        variant="secondary"
        className="bg-yellow-50 border-yellow-700 text-yellow-700 flex items-center gap-1"
      >
        <Clock className="w-3 h-3" /> {item.status_label}
      </Badge>
    );
  }
  if (item.status === 2) return <Badge variant="default">{item.status_label}</Badge>;
  if (item.status === 3) return <Badge variant="destructive">{item.status_label}</Badge>;
  return <Badge variant="outline">{item.status_label}</Badge>;
}

export const SectionSupervisorAssessment = () => {
  const t = useTranslations('ess');
  const tCommon = useTranslations('common');
  const tSidebar = useTranslations('sidebar');

  const { data, isLoading } = useQuery({
    queryKey: ['ess-supervisor-assessments'],
    queryFn: () => getEssSupervisorAssessments({ per_page: 20 }),
  });

  const rows = data?.data ?? [];

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6 md:px-12">
      <h2 className="font-semibold text-xl text-primary">
        {tSidebar('supervisorAssessment')}
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{tCommon('noData')}</p>
      ) : (
        <div className="space-y-3">
          {rows.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-white space-y-2"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {item.form?.name ? (
                    <span className="font-semibold text-sm">{item.form.name}</span>
                  ) : (
                    <span className="font-semibold text-sm">
                      {tSidebar('supervisorAssessment')} #{item.id}
                    </span>
                  )}
                  {statusBadge(item)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.created_at.slice(0, 10)}
                </span>
              </div>

              {item.schedule && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {item.schedule.date} {item.schedule.start_time} – {item.schedule.end_time}
                </div>
              )}

              {(item.assessors ?? []).length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {t('assessmentAssessors')}:{' '}
                  {(item.assessors ?? [])
                    .map((a) => a.user?.name ?? `#${a.id}`)
                    .join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
