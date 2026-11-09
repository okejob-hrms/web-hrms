'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatPeriodDateWithWeekday } from '@/lib/payroll-period';
import { resolveLocale } from '@/lib/i18n/locale';
import type { RecordActionTarget } from '../types';
import { formatLocalDateTime } from './format';

interface RecordActionDialogProps {
  /** Remount with a new `key` per target so the remarks start empty. */
  target: RecordActionTarget | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => void;
}

export function RecordActionDialog({ target, isPending, onClose, onConfirm }: RecordActionDialogProps) {
  const t = useTranslations('attendanceReview');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());
  const [remarks, setRemarks] = React.useState('');

  const isReject = target?.kind === 'reject';
  const record = target?.record ?? null;
  const date = record?.attendance_date ?? target?.issue.date ?? null;
  const times = record
    ? `${formatLocalDateTime(record.in_local, locale) ?? t('noClockIn')} → ${
        formatLocalDateTime(record.out_local, locale) ?? t('noClockOut')
      }`
    : null;

  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-w-md bg-white">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isPending) onConfirm(remarks.trim());
          }}
        >
          <DialogHeader>
            <DialogTitle>{isReject ? t('rejectTitle') : t('markAbsentTitle')}</DialogTitle>
            <DialogDescription>
              {[target?.issue.employee?.name, date ? formatPeriodDateWithWeekday(date, locale) : null]
                .filter(Boolean)
                .join(' · ')}
            </DialogDescription>
          </DialogHeader>
          {times ? <p className="text-sm font-medium">{times}</p> : null}
          <p className="text-sm text-text-secondary">
            {isReject ? t('rejectDescription') : t('markAbsentDescription')}
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="attendance-review-remarks">{t('remarksLabel')}</Label>
            <Textarea
              id="attendance-review-remarks"
              value={remarks}
              maxLength={255}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isPending} onClick={onClose}>
              {tCommon('cancel')}
            </Button>
            <Button type="submit" variant={isReject ? 'destructive' : 'default'} disabled={isPending}>
              {isPending ? tCommon('processing') : isReject ? t('actionReject') : t('actionMarkAbsent')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
