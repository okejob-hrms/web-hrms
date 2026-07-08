'use client';

import { useTranslations } from 'next-intl';

type WorkingHourSummaryProps = {
  regularHour: number;
  overtimeHour: number;
};

export default function WorkingHourSummary({
  regularHour,
  overtimeHour,
}: WorkingHourSummaryProps) {
  const t = useTranslations('payroll');
  const tAtt = useTranslations('attendance');
  const total = regularHour + overtimeHour;
  const regularPercent = total > 0 ? (regularHour / total) * 100 : 0;
  const overtimePercent = total > 0 ? (overtimeHour / total) * 100 : 0;

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t('workingHourSummary')}
      </h2>

      <div className="flex justify-between text-sm font-medium mb-2">
        <div>
          <span className="text-3xl font-bold text-black">{regularHour}</span>
          <span className="text-gray-500 ml-1">{t('hours')}</span>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-black">{overtimeHour}</span>
          <span className="text-gray-500 ml-1">{t('hours')}</span>
        </div>
      </div>

      <div className="flex w-full h-4 overflow-hidden rounded-full bg-gray-200">
        <div
          className="bg-sky-300 h-full"
          style={{ width: `${regularPercent}%` }}
        />
        <div
          className="bg-amber-400 h-full"
          style={{ width: `${overtimePercent}%` }}
        />
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-sky-300"></span>
          {t('regularHour')}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-amber-400"></span>
          {tAtt('overtime')}
        </div>
      </div>
    </div>
  );
}
