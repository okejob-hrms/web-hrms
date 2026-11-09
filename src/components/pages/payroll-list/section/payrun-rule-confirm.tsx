'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { formatPeriodDate } from '@/lib/payroll-period';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  PAYRUN_ATTENDANCE_NOT_REVIEWED,
  PAYRUN_GAP,
  PayrunRuleError,
} from '@/services/payroll/types';

interface Props {
  error: PayrunRuleError | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function PayrunRuleConfirm({ error, onConfirm, onCancel }: Props) {
  const t = useTranslations('payroll');
  const locale = useLocale();
  const formatDate = (value?: string) => formatPeriodDate(value, locale);
  const tCommon = useTranslations('common');
  const isGap = error?.error_code === PAYRUN_GAP;
  const isAttendance = error?.error_code === PAYRUN_ATTENDANCE_NOT_REVIEWED;
  const reviewHref = isAttendance
    ? `/attendance/attendance-review?${new URLSearchParams({
        start: error?.details?.start ?? '',
        end: error?.details?.end ?? '',
      }).toString()}`
    : '';

  const title = isGap
    ? t('payrunGapTitle')
    : isAttendance
      ? t('payrunAttendanceTitle')
      : t('payrunNotEndedTitle');
  const confirmLabel = isGap
    ? t('payrunGapConfirm')
    : isAttendance
      ? t('payrunAttendanceConfirm')
      : t('payrunNotEndedConfirm');

  return (
    <AlertDialog
      open={error !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-sm text-gray-600">
              {isGap ? (
                <>
                  <p>{t('payrunGapDescription')}</p>
                  <ul className="list-disc pl-5">
                    {(error?.details?.gaps ?? []).map((gap) => (
                      <li key={`${gap.from}-${gap.to}`}>
                        {formatDate(gap.from)} – {formatDate(gap.to)}
                      </li>
                    ))}
                  </ul>
                </>
              ) : isAttendance ? (
                <p>
                  {t('payrunAttendanceDescription', {
                    waiting: error?.details?.waiting_count ?? 0,
                  })}
                </p>
              ) : (
                <p>
                  {t('payrunNotEndedDescription', {
                    periodEnd: formatDate(error?.details?.period_end),
                    today: formatDate(error?.details?.today),
                  })}
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {tCommon('cancel')}
          </AlertDialogCancel>
          {isAttendance && (
            <Button variant="outline" asChild>
              <Link href={reviewHref} onClick={onCancel}>
                {t('payrunAttendanceOpenReview')}
              </Link>
            </Button>
          )}
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
