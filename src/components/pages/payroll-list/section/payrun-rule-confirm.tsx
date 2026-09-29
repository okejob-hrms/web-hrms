'use client';

import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
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

const formatDate = (value?: string) =>
  value ? dayjs(value).format('D MMM YYYY') : '-';

export default function PayrunRuleConfirm({ error, onConfirm, onCancel }: Props) {
  const t = useTranslations('payroll');
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
