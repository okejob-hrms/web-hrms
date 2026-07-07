'use client';

import React, { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RequestPayrollGroup } from '@/services/payroll/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { year } from '@/lib/utils';
import { getMonthOptions } from '@/lib/formatting';
import { resolveLocale } from '@/lib/i18n/locale';
import dayjs from 'dayjs';

interface Props {
  onUpdate: (e?: React.FormEvent) => void;
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  formData: RequestPayrollGroup;
  setFormData: React.Dispatch<React.SetStateAction<RequestPayrollGroup>>;
}

export default function PayrunsAddModal({
  onUpdate,
  isOpen,
  setIsOpen,
  formData,
  setFormData,
}: Props) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());
  const monthOptions = useMemo(() => getMonthOptions(locale), [locale]);

  const handleUpdate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onUpdate();
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating payroll group:', error);
    }
  };

  return (
    <div className="space-y-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
          <AlertDialogHeader className="text-center items-center justify-center">
            <AlertDialogTitle className="text-lg text-center font-semibold text-black mb-2">
              {t('addPayrollGroup')}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-3 space-y-2 mb-4">
            <div className="col-span-2">
              <div className="text-sm text-gray-500">{t('paymentPeriod')}</div>
              <div className="grid grid-cols-2 gap-3 space-y-2">
                <div className="col-span-1">
                  <Select
                    onValueChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        period_month: Number(e),
                      }));
                    }}
                    value={String(formData.period_month)}
                    defaultValue={String(
                      formData.period_month ?? new Date().getMonth(),
                    )}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tCommon('selectMonth')} />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((item, i) => (
                        <SelectItem value={String(item.id)} key={i}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  <Select
                    onValueChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        period_year: Number(e),
                      }));
                    }}
                    value={String(formData.period_year)}
                    defaultValue={String(
                      formData.period_year ?? new Date().getFullYear(),
                    )}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tCommon('selectYear')} />
                    </SelectTrigger>
                    <SelectContent>
                      {year.map((item, i) => (
                        <SelectItem value={String(item.id)} key={i}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-3 space-y-2">
                <div className="col-span-1">
                  <div className="text-sm text-gray-500">
                    {t('sendPayslipDate')}
                  </div>
                  <Input
                    type="date"
                    value={formData.send_payslip_at}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        send_payslip_at: dayjs(e.target.value).format(
                          'YYYY-MM-DD',
                        ),
                      }));
                    }}
                  />
                </div>
                <div className="col-span-1">
                  <div className="text-sm text-gray-500">
                    {t('sendPayslipAutomatically')}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600">{tCommon('no')}</span>
                    <Switch
                      checked={formData.auto_send_payslip}
                      onCheckedChange={() => {
                        setFormData((prev) => ({
                          ...prev,
                          auto_send_payslip: !formData.auto_send_payslip,
                        }));
                      }}
                    />
                    <span className="text-sm text-blue-600 font-medium">
                      {tCommon('active')}
                    </span>
                  </div>
                  {formData.auto_send_payslip && (
                    <>
                      <Input
                        className="mt-3"
                        type="time"
                        value={new Date(
                          formData.send_payslip_at ?? '',
                        ).getTime()}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            overtime_date: e.target.value,
                          }));
                        }}
                      />
                      <span className="text-sm text-gray-500 font-medium">
                        {t('payslipSentOnSelectedDateTime')}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

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
