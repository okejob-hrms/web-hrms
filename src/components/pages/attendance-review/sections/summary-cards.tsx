'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import type { AttendanceReviewSummary } from '@/services/attendance-review/types';
import { cn } from '@/lib/utils';

interface SummaryCardsProps {
  summary: AttendanceReviewSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const t = useTranslations('attendanceReview');
  const { counts, issues } = summary;

  const cards = [
    { label: t('cardEmployees'), value: counts.employees },
    { label: t('cardRecords'), value: counts.records },
    { label: t('cardWaiting'), value: counts.waiting },
    { label: t('cardApproved'), value: counts.approved },
    {
      label: t('cardBlockersOpen'),
      value: issues.blocker.open,
      className: issues.blocker.open > 0 ? 'text-red-600' : undefined,
    },
    {
      label: t('cardWarningsOpen'),
      value: issues.warning.open,
      className: issues.warning.open > 0 ? 'text-amber-600' : undefined,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <div key={card.label} className="rounded-md border border-gray-200 bg-white p-4">
          <div className="text-xs text-text-secondary">{card.label}</div>
          <div className={cn('mt-1 text-2xl font-semibold', card.className)}>
            {card.value.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
