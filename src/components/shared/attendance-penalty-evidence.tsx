'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useLocale, useTranslations } from 'next-intl';
import { formatPeriodDate } from '@/lib/payroll-period';

type AttendancePenaltyEvidenceListProps = {
  items: DeductionList[];
  emptyLabel?: string;
};

function metaSummary(
  meta: AttendancePenaltyMeta | null | undefined,
  tEmployee: (key: string, values?: Record<string, string | number | Date>) => string,
  tPayroll: (key: string, values?: Record<string, string | number | Date>) => string,
): string[] {
  if (!meta) return [];

  const parts: string[] = [];
  const isAbsent = meta.trigger_type === 'absent';

  if (meta.count !== undefined) {
    parts.push(tPayroll('occurrenceCountValue', { count: meta.count }));
  }
  if (!isAbsent && typeof meta.minutes === 'number') {
    parts.push(tEmployee('minutesUnit', { minutes: meta.minutes }));
  }
  if (meta.occurrence_index !== undefined) {
    parts.push(tPayroll('occurrenceIndexValue', { index: meta.occurrence_index }));
  }
  if (
    typeof meta.min_threshold === 'number' &&
    typeof meta.max_threshold === 'number'
  ) {
    parts.push(
      tPayroll('thresholdRangeValue', {
        min: meta.min_threshold,
        max: meta.max_threshold,
      }),
    );
  }
  if (meta.impact_type === 'allowance') {
    parts.push(tPayroll('allowance'));
  } else if (meta.impact_type === 'base_salary') {
    parts.push(tEmployee('baseSalary'));
  }

  return parts;
}

export function AttendancePenaltyEvidenceList({
  items,
  emptyLabel,
}: AttendancePenaltyEvidenceListProps) {
  const t = useTranslations('employee');
  const tPayroll = useTranslations('payroll');
  const locale = useLocale();
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
        const summary = metaSummary(item.meta, t, tPayroll);

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
            {item.incurred_on ? (
              <p className="text-xs text-muted-foreground">
                {tPayroll('penaltyIncurredOn')}: {formatPeriodDate(item.incurred_on, locale)}
              </p>
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
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col overflow-hidden p-6 rounded-2xl bg-white">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title ?? t('penaltyEvidenceTitle')}</DialogTitle>
          <DialogDescription className="sr-only">
            {t('penaltyEvidenceDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto pr-1">
          <AttendancePenaltyEvidenceList items={items} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
