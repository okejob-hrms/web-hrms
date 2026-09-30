'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RequestPayrollGroup } from '@/services/payroll/types';

interface Props {
  formData: RequestPayrollGroup;
  setFormData: React.Dispatch<React.SetStateAction<RequestPayrollGroup>>;
}

/**
 * @deprecated Hidden behind PAYSLIP_AUTO_SEND_ENABLED. The time input writes to a field the API
 * does not read; fix it before resurfacing.
 */
export default function AutoSendPayslipFields({ formData, setFormData }: Props) {
  const t = useTranslations('payroll');
  const tCommon = useTranslations('common');

  return (
    <div className="col-span-2">
      <div className="grid grid-cols-2 gap-3 space-y-2">
        <div className="col-span-1">
          <div className="text-sm text-gray-500">{t('sendPayslipDate')}</div>
          <Input
            type="date"
            value={formData.send_payslip_at}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                send_payslip_at: dayjs(e.target.value).format('YYYY-MM-DD'),
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
                value={new Date(formData.send_payslip_at ?? '').getTime()}
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
  );
}
