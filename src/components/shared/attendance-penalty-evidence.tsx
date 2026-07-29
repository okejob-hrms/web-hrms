'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  AttendancePenaltyMeta,
  DeductionList,
  getAttendancePenalties,
} from '@/services/payroll/types';
import { useTranslations } from 'next-intl';

type AttendancePenaltyEvidenceListProps = {
  items: DeductionList[];
  emptyLabel?: string;
};

function metaSummary(
  meta: AttendancePenaltyMeta | null | undefined,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string[] {
  if (!meta) return [];

  const parts: string[] = [];

  if (meta.count !== undefined) {
    parts.push(t('occurrenceCount') + ': ' + meta.count);
  }
  if (meta.minutes !== undefined) {
    parts.push(t('minutesUnit', { minutes: meta.minutes }));
  }
  if (meta.occurrence_index !== undefined) {
    parts.push(t('occurrenceIndex') + ': ' + meta.occurrence_index);
  }
  if (meta.min_threshold !== undefined && meta.max_threshold !== undefined) {
    parts.push(`${meta.min_threshold}–${meta.max_threshold}`);
  }
  if (meta.impact_type === 'allowance') {
    parts.push(t('allowance'));
  } else if (meta.impact_type === 'base_salary') {
    parts.push(t('baseSalary'));
  }

  return parts;
}

export function AttendancePenaltyEvidenceList({
  items,
  emptyLabel,
}: AttendancePenaltyEvidenceListProps) {
  const t = useTranslations('employee');
  const tPayroll = useTranslations('payroll');
  const penalties = getAttendancePenalties(items);

  if (penalties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyLabel ?? tPayroll('noAttendancePenalties')}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {penalties.map((item) => {
        const summary = metaSummary(item.meta, t);

        return (
          <div
            key={item.user_penalty_id ?? `${item.name}-${item.amount}`}
            className="rounded-lg border border-border p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="font-medium text-sm text-foreground">{item.name}</div>
                {item.condition_type ? (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {item.condition_type === 'monthly_aggregate'
                      ? t('monthlyAggregate')
                      : t('perOccurrence')}
                  </Badge>
                ) : null}
              </div>
              <div className="text-sm font-semibold whitespace-nowrap text-foreground">
                Rp {formatCurrency(Number(item.amount))}
              </div>
            </div>
            {item.description ? (
              <p className="text-sm text-muted-foreground">{item.description}</p>
            ) : null}
            {summary.length > 0 ? (
              <p className="text-xs text-muted-foreground">{summary.join(' · ')}</p>
            ) : null}
            {item.period ? (
              <p className="text-xs text-muted-foreground">
                {tPayroll('period')}: {item.period}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

type AttendancePenaltyEvidenceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: DeductionList[];
  title?: string;
};

export function AttendancePenaltyEvidenceDialog({
  open,
  onOpenChange,
  items,
  title,
}: AttendancePenaltyEvidenceDialogProps) {
  const t = useTranslations('payroll');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 rounded-2xl bg-white">
        <DialogHeader>
          <DialogTitle>{title ?? t('penaltyEvidenceTitle')}</DialogTitle>
        </DialogHeader>
        <AttendancePenaltyEvidenceList items={items} />
      </DialogContent>
    </Dialog>
  );
}
