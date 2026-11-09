'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Info, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { MAX_PAY_PERIOD_DAYS, formatPeriodRange } from '@/lib/payroll-period';
import { resolveLocale } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';
import { groupCount, useAttendanceReview } from './hook';
import { AcceptIssueDialog } from './sections/accept-issue-dialog';
import { BulkApproveDialog } from './sections/bulk-approve-dialog';
import { CheckGroups } from './sections/check-groups';
import { IssueList } from './sections/issue-list';
import { NoRosterGroups } from './sections/no-roster-groups';
import { PeriodPicker } from './sections/period-picker';
import { RecordActionDialog } from './sections/record-action-dialog';
import { ResolveUnresolvedDialog } from './sections/resolve-unresolved-dialog';
import { ReviewChecklist } from './sections/review-checklist';
import { SummaryCards } from './sections/summary-cards';

export function AttendanceReview() {
  const t = useTranslations('attendanceReview');
  const locale = resolveLocale(useLocale());
  const review = useAttendanceReview();
  const {
    period,
    activePeriod,
    periodError,
    summary,
    summaryQuery,
    checks,
    includeClosed,
  } = review;

  const blockersOpen = summary?.issues.blocker.open ?? 0;
  const warningsOpen = summary?.issues.warning.open ?? 0;
  const approvable = summary?.counts.approvable_now ?? 0;
  const waiting = summary?.counts.waiting ?? 0;
  const hasAnyGroup = checks.some((check) => groupCount(check, includeClosed) > 0);
  const periodLabel = summary
    ? `${summary.period.label} · ${formatPeriodRange(summary.period.start, summary.period.end, locale)}`
    : activePeriod
      ? formatPeriodRange(activePeriod.start, activePeriod.end, locale)
      : null;

  return (
    <div className="flex min-h-screen flex-col gap-5 px-6 pt-6 font-sans md:px-11">
      <header>
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        {periodLabel ? <p className="text-sm text-text-secondary">{periodLabel}</p> : null}
      </header>

      <p className="flex items-center gap-2 text-sm text-text-secondary">
        <Info className="size-4 shrink-0" aria-hidden />
        {t('nightShiftInfo')}
      </p>

      {review.usedFallbackPeriod ? (
        <Alert>
          <AlertDescription>{t('fallbackPeriodNotice')}</AlertDescription>
        </Alert>
      ) : null}

      {periodError ? (
        <Alert variant="destructive">
          <AlertDescription>{t(`periodError.${periodError}`, { max: MAX_PAY_PERIOD_DAYS })}</AlertDescription>
        </Alert>
      ) : null}

      {summaryQuery.isError ? (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
            {t('summaryLoadFailed')}
            <Button size="sm" variant="outline" onClick={review.refresh}>
              {t('retry')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {summaryQuery.isLoading || review.isPeriodLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20" />
            ))}
          </div>
        </div>
      ) : summary ? (
        <>
          <ReviewChecklist
            blockersOpen={blockersOpen}
            warningsOpen={warningsOpen}
            approvable={approvable}
            waiting={waiting}
            approveDisabled={review.bulkApproveMutation.isPending}
            onFixBlockers={review.firstBlockerCode ? () => review.setCode(review.firstBlockerCode!) : undefined}
            onCheckWarnings={review.firstWarningCode ? () => review.setCode(review.firstWarningCode!) : undefined}
            onApprove={() => review.setOpenBulkApprove(true)}
          />
          <SummaryCards summary={summary} />
        </>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          {review.isPeriodLoading ? (
            <Skeleton className="h-9 w-80" />
          ) : (
            <PeriodPicker
              key={period ? `${period.start}|${period.end}` : 'empty'}
              value={period}
              onApply={review.setPeriod}
              trailing={
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={review.refresh}
                    disabled={!activePeriod || review.isRefreshing}
                    aria-label={t('refresh')}
                  >
                    <RefreshCw className={cn(review.isRefreshing && 'animate-spin')} />
                    {t('refresh')}
                  </Button>
                  <label className="mb-2 flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={includeClosed}
                      onCheckedChange={(checked) => review.setIncludeClosed(checked === true)}
                    />
                    {t('includeClosed')}
                  </label>
                </>
              }
            />
          )}
        </div>

        {summary ? (
          <div className="w-full">
            {review.effectiveCode === 'unresolved_punches' ? (
              <div className="mb-4">
                <NoRosterGroups groups={summary.unresolved_no_roster_groups ?? []} />
              </div>
            ) : null}
            <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
              <CheckGroups
                checks={checks}
                selectedCode={review.effectiveCode}
                includeClosed={includeClosed}
                onSelect={review.setCode}
              />
              <IssueList
                selectedCheck={review.selectedCheck}
                hasAnyGroup={hasAnyGroup}
                issues={review.issues}
                pagination={review.issuesPagination}
                isLoading={review.issuesQuery.isLoading}
                isError={review.issuesQuery.isError}
                isFetching={review.issuesQuery.isFetching}
                page={review.page}
                onPageChange={review.setPage}
                searchInput={review.searchInput}
                onSearchChange={review.setSearchInput}
                onRetry={() => review.issuesQuery.refetch()}
                editHref={review.editHref}
                unresolvedHref={review.unresolvedHref}
                onAccept={review.setAcceptTarget}
                onResolveUnresolved={review.setResolveUnresolvedTarget}
                onRecordAction={review.setRecordActionTarget}
              />
            </div>
          </div>
        ) : null}
      </div>

      <BulkApproveDialog
        open={review.openBulkApprove}
        approvable={approvable}
        blockersOpen={blockersOpen}
        warningsOpen={warningsOpen}
        isPending={review.bulkApproveMutation.isPending}
        onOpenChange={review.setOpenBulkApprove}
        onConfirm={() => review.bulkApproveMutation.mutate()}
      />

      <AcceptIssueDialog
        key={review.acceptTarget?.issue_key ?? 'accept-none'}
        issue={review.acceptTarget}
        isPending={review.acceptMutation.isPending}
        onClose={() => review.setAcceptTarget(null)}
        onConfirm={(note) =>
          review.acceptTarget && review.acceptMutation.mutate({ issue: review.acceptTarget, note })
        }
      />

      <ResolveUnresolvedDialog
        key={review.resolveUnresolvedTarget?.issue_key ?? 'resolve-none'}
        issue={review.resolveUnresolvedTarget}
        isPending={review.resolveUnresolvedMutation.isPending}
        onClose={() => review.setResolveUnresolvedTarget(null)}
        onResolve={(items) => review.resolveUnresolvedMutation.mutate(items)}
      />

      <RecordActionDialog
        key={
          review.recordActionTarget
            ? `${review.recordActionTarget.kind}|${review.recordActionTarget.issue.issue_key}|${review.recordActionTarget.record?.id ?? 'day'}`
            : 'record-none'
        }
        target={review.recordActionTarget}
        isPending={review.recordActionMutation.isPending}
        onClose={() => review.setRecordActionTarget(null)}
        onConfirm={(remarks) =>
          review.recordActionTarget &&
          review.recordActionMutation.mutate({ target: review.recordActionTarget, remarks })
        }
      />
    </div>
  );
}
