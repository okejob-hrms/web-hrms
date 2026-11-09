'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiPagination } from '@/lib/types';
import type { AttendanceReviewIssue, ReviewCheckCount, ReviewRecord } from '@/services/attendance-review/types';
import type { RecordActionTarget } from '../types';
import { checkTitle } from './check-labels';
import { IssueCard } from './issue-card';

interface IssueListProps {
  selectedCheck: ReviewCheckCount | null;
  hasAnyGroup: boolean;
  issues: AttendanceReviewIssue[];
  pagination?: ApiPagination;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
  searchInput: string;
  onSearchChange: (value: string) => void;
  onRetry?: () => void;
  editHref: (issue: AttendanceReviewIssue, record: ReviewRecord) => string | null;
  unresolvedHref: (issue: AttendanceReviewIssue) => string;
  onAccept: (issue: AttendanceReviewIssue) => void;
  onResolveUnresolved: (issue: AttendanceReviewIssue) => void;
  onRecordAction: (target: RecordActionTarget) => void;
}

export function IssueList({
  selectedCheck,
  hasAnyGroup,
  issues,
  pagination,
  isLoading,
  isError,
  isFetching,
  page,
  onPageChange,
  searchInput,
  onSearchChange,
  onRetry,
  editHref,
  unresolvedHref,
  onAccept,
  onResolveUnresolved,
  onRecordAction,
}: IssueListProps) {
  const t = useTranslations('attendanceReview');
  const tCommon = useTranslations('common');

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="w-full md:w-72"
          placeholder={t('searchPlaceholder')}
          icon={<Search className="size-5 text-grayscale-20" />}
          iconPosition="right"
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label={t('searchPlaceholder')}
        />
      </div>

      {selectedCheck ? (
        <h2 className="text-base font-semibold">
          {checkTitle(t, selectedCheck.code, selectedCheck.title)}
          {pagination ? (
            <span className="ml-2 text-sm font-normal text-text-secondary">
              {t('issueCount', { count: pagination.total })}
            </span>
          ) : null}
        </h2>
      ) : null}

      {!hasAnyGroup && !selectedCheck ? (
        <div className="rounded-md border border-dashed border-green-300 bg-green-50 p-8 text-center text-sm text-green-800">
          {t('emptyAll')}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 rounded-md bg-destructive/5 p-4 text-center text-sm text-destructive">
          <span>{t('issuesLoadFailed')}</span>
          {onRetry ? (
            <Button size="sm" variant="outline" onClick={onRetry}>
              {t('retry')}
            </Button>
          ) : null}
        </div>
      ) : issues.length === 0 ? (
        <div className="rounded-md border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-text-secondary">
          {searchInput.trim() !== '' ? t('emptySearch') : t('emptyGroup')}
        </div>
      ) : (
        <div className={isFetching ? 'flex flex-col gap-3 opacity-60 transition-opacity' : 'flex flex-col gap-3'}>
          {issues.map((issue) => (
            <IssueCard
              key={issue.issue_key}
              issue={issue}
              editHref={editHref}
              unresolvedHref={unresolvedHref}
              onAccept={onAccept}
              onResolveUnresolved={onResolveUnresolved}
              onRecordAction={onRecordAction}
            />
          ))}
        </div>
      )}

      {pagination && pagination.last_page > 1 ? (
        <div className="flex items-center justify-between text-sm text-text-secondary">
          <span>
            {t('pageOf', { page: pagination.current_page, last: pagination.last_page, total: pagination.total })}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              {tCommon('previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.last_page}
              onClick={() => onPageChange(page + 1)}
            >
              {tCommon('next')}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
