'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MAX_PAY_PERIOD_DAYS, periodDays } from '@/lib/payroll-period';
import type { ReviewPeriodRange } from '@/services/attendance-review/types';
import { validatePeriod } from '../hook';

interface PeriodPickerProps {
  /** Remount with a new `key` when this changes, so the draft resets. */
  value: ReviewPeriodRange | null;
  onApply: (range: ReviewPeriodRange) => void;
  disabled?: boolean;
  /** Aligned with Apply (e.g. Refresh) — kept in the same items-end row as the date inputs. */
  trailing?: React.ReactNode;
}

export function PeriodPicker({ value, onApply, disabled, trailing }: PeriodPickerProps) {
  const t = useTranslations('attendanceReview');
  const [draft, setDraft] = React.useState<ReviewPeriodRange>(value ?? { start: '', end: '' });

  const complete = draft.start !== '' && draft.end !== '';
  const error = complete ? validatePeriod(draft) : null;
  const dirty = !value || draft.start !== value.start || draft.end !== value.end;
  const days = complete && !error ? periodDays(draft.start, draft.end) : null;

  return (
    <form
      className="flex flex-col gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (complete && !error) onApply(draft);
      }}
    >
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="attendance-review-start" className="text-xs text-text-secondary">
            {t('periodStart')}
          </label>
          <Input
            id="attendance-review-start"
            type="date"
            value={draft.start}
            max={draft.end || undefined}
            disabled={disabled}
            onChange={(e) => setDraft((prev) => ({ ...prev, start: e.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="attendance-review-end" className="text-xs text-text-secondary">
            {t('periodEnd')}
          </label>
          <Input
            id="attendance-review-end"
            type="date"
            value={draft.end}
            min={draft.start || undefined}
            disabled={disabled}
            onChange={(e) => setDraft((prev) => ({ ...prev, end: e.target.value }))}
          />
        </div>
        <Button type="submit" variant="outline" disabled={disabled || !dirty || !complete || !!error}>
          {t('applyPeriod')}
        </Button>
        {trailing}
      </div>
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {t(`periodError.${error}`, { max: MAX_PAY_PERIOD_DAYS })}
        </p>
      ) : days ? (
        <p className="text-xs text-text-secondary">{t('periodDays', { days })}</p>
      ) : null}
    </form>
  );
}
