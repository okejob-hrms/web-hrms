'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import type { ReviewCheckCount, ReviewSeverity } from '@/services/attendance-review/types';
import { cn } from '@/lib/utils';
import { groupCount } from '../hook';
import { checkTitle } from './check-labels';
import { SEVERITY_STYLES } from './format';

const SEVERITY_ORDER: ReviewSeverity[] = ['blocker', 'warning', 'info'];

interface CheckGroupsProps {
  checks: ReviewCheckCount[];
  selectedCode: string;
  includeClosed: boolean;
  onSelect: (code: string) => void;
}

export function CheckGroups({ checks, selectedCode, includeClosed, onSelect }: CheckGroupsProps) {
  const t = useTranslations('attendanceReview');

  const sections = SEVERITY_ORDER.map((severity) => ({
    severity,
    items: checks.filter(
      (check) =>
        check.severity === severity &&
        (groupCount(check, includeClosed) > 0 || check.code === selectedCode),
    ),
  })).filter((section) => section.items.length > 0);

  if (sections.length === 0) {
    return (
      <aside className="rounded-md border border-gray-200 bg-white p-4 text-sm text-text-secondary">
        {t('noGroups')}
      </aside>
    );
  }

  return (
    <aside className="flex flex-col gap-4 rounded-md border border-gray-200 bg-white p-3">
      {sections.map((section) => (
        <div key={section.severity}>
          <h3 className="mb-1 flex items-center gap-2 px-2 text-xs font-semibold uppercase text-text-secondary">
            <span className={cn('size-2 rounded-full', SEVERITY_STYLES[section.severity].dot)} aria-hidden />
            {t(`severity.${section.severity}`)}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((check) => {
              const selected = check.code === selectedCode;
              return (
                <li key={check.code}>
                  <button
                    type="button"
                    onClick={() => onSelect(check.code)}
                    aria-current={selected ? 'true' : undefined}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50',
                      selected && 'bg-primary/10 font-medium text-primary hover:bg-primary/10',
                    )}
                  >
                    <span>{checkTitle(t, check.code, check.title)}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs',
                        SEVERITY_STYLES[check.severity].badge,
                      )}
                    >
                      {groupCount(check, includeClosed)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
