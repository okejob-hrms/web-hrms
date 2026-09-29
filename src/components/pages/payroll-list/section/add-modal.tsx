'use client';

import React, { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RequestPayrollGroup } from '@/services/payroll/types';
import { getMonthOptions } from '@/lib/formatting';
import { PAYSLIP_AUTO_SEND_ENABLED } from '@/lib/feature-flags';
import { majorityLabel, periodDays } from '@/lib/payroll-period';
import AutoSendPayslipFields from './auto-send-payslip-fields';
import { resolveLocale } from '@/lib/i18n/locale';
import dayjs from 'dayjs';

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  formData: RequestPayrollGroup;
  setFormData: React.Dispatch<React.SetStateAction<RequestPayrollGroup>>;
  previousPeriodEnd?: string | null;
}

export default function PayrunsAddModal({
  onUpdate,
  isOpen,
  setIsOpen,
  formData,
  setFormData,
  previousPeriodEnd,
}: Props) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);
  const periodLabel = useMemo(() => {
    const month = monthOptions.find(
      (item) => Number(item.id) === Number(formData.period_month),
    );
    return formData.period_end && month
      ? `${month.label} ${formData.period_year}`
      : '';
  }, [monthOptions, formData.period_end, formData.period_month, formData.period_year]);
  const days = periodDays(formData.period_start ?? '', formData.period_end ?? '');

  const setDates = (start: string, end: string) => {
    const label = majorityLabel(start, end);
    setFormData((prev) => ({
      ...prev,
      period_start: start,
      period_end: end,
      ...(label ? { period_year: label.year, period_month: label.month } : {}),
    }));
  };

  // The hook closes the modal once the payrun is created, so validation and
  // acknowledgement prompts keep the entered dates.
  const handleUpdate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              {t('addPayrollGroup')}
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              {t('addPayrollGroupDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 space-y-2 mb-4">
            <div className="col-span-2">
              <div className="text-sm text-gray-500">{t('paymentPeriod')}</div>
              <div className="grid grid-cols-2 gap-3 space-y-2">
                <div className="col-span-1">
                  <label
                    htmlFor="payrun-period-start"
                    className="text-xs text-gray-500"
                  >
                    {t('periodStartDate')}
                  </label>
                  <Input
                    id="payrun-period-start"
                    type="date"
                    value={formData.period_start ?? ''}
                    onChange={(e) => setDates(e.target.value, formData.period_end ?? '')}
                  />
                </div>
                <div className="col-span-1">
                  <label
                    htmlFor="payrun-period-end"
                    className="text-xs text-gray-500"
                  >
                    {t('periodCutoffDate')}
                  </label>
                  <Input
                    id="payrun-period-end"
                    type="date"
                    min={formData.period_start || undefined}
                    value={formData.period_end ?? ''}
                    onChange={(e) => setDates(formData.period_start ?? '', e.target.value)}
                  />
                </div>
              </div>
              {periodLabel && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('periodLabelHint', {
                    label: periodLabel,
                    days,
                  })}
                </p>
              )}
              {previousPeriodEnd && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('periodPrefillHint', {
                    date: dayjs(previousPeriodEnd).format('D MMM YYYY'),
                  })}
                </p>
              )}
            </div>

            {PAYSLIP_AUTO_SEND_ENABLED && (
              <AutoSendPayslipFields formData={formData} setFormData={setFormData} />
            )}

            <div className="col-span-2">
              <div className="text-sm text-gray-500">{tCommon('notes')}</div>
              <Textarea
                rows={5}
                value={formData.notes}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
          <AlertDialogFooter className="flex justify-between gap-3 w-full">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="flex-1 border text-primary border-primary bg-white hover:bg-blue-50 rounded-md py-2 font-medium"
            >
              {tCommon('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdate}
              className="flex-1 bg-primary text-white rounded-md py-2 font-medium"
            >
              {tCommon('save')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
