'use client';

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
import {
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

  return (
    <AlertDialog
      open={error !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isGap ? t('payrunGapTitle') : t('payrunNotEndedTitle')}
          </AlertDialogTitle>
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
          <AlertDialogAction onClick={onConfirm}>
            {isGap ? t('payrunGapConfirm') : t('payrunNotEndedConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
