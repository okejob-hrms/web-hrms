'use client';

import * as React from 'react';
import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { getNextPeriod } from '@/services/payroll';
import { postMarkAttendanceAbsent, putAttendanceStatus } from '@/services/attendance';
import {
  getAttendanceReviewIssues,
  getAttendanceReviewSummary,
  postAttendanceReviewAcknowledgement,
  postAttendanceReviewBulkApprove,
  postAttendanceReviewResolveUnresolved,
} from '@/services/attendance-review';
import type {
  AttendanceReviewIssue,
  AttendanceReviewIssueListResponse,
  ResolveUnresolvedItem,
  ReviewCheckCount,
  ReviewPeriodRange,
  ReviewRecord,
  ReviewSeverity,
  ReviewStateFilter,
} from '@/services/attendance-review/types';
import { MAX_PAY_PERIOD_DAYS, periodDays } from '@/lib/payroll-period';
import { todayInIndonesiaTimezone } from '@/lib/indonesia-timezone';
import { getErrorMessage } from '@/components/shared/shift-roster/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { REVIEW_TABS, type PeriodError, type RecordActionTarget, type ReviewTab } from './types';

export const REVIEW_PATH = '/attendance/attendance-review';
const UNRESOLVED_PUNCHES_PATH = '/settings/time-attendance/unresolved-punches';
const ISSUES_PER_PAGE = 20;
const ATTENDANCE_STATUS_REJECTED = 2;
const ATTENDANCE_STATUS_ABSENT = 3;

const isIsoDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && dayjs(value).format('YYYY-MM-DD') === value;

export function validatePeriod(range: ReviewPeriodRange): PeriodError | null {
  if (!isIsoDate(range.start) || !isIsoDate(range.end)) return 'invalidDate';
  if (range.end < range.start) return 'endBeforeStart';
  if (periodDays(range.start, range.end) > MAX_PAY_PERIOD_DAYS) return 'tooLong';
  return null;
}

/** Used when the payrun next-period suggestion cannot be loaded: the current calendar month. */
const fallbackPeriod = (): ReviewPeriodRange => {
  const today = dayjs(todayInIndonesiaTimezone());
  return {
    start: today.startOf('month').format('YYYY-MM-DD'),
    end: today.endOf('month').format('YYYY-MM-DD'),
  };
};

const parseTab = (value: string | null): ReviewTab =>
  (REVIEW_TABS as readonly string[]).includes(value ?? '') ? (value as ReviewTab) : 'issues';

/** Count shown next to a check group; matches what the issue list returns for the state filter. */
export const groupCount = (check: ReviewCheckCount, includeClosed: boolean) =>
  includeClosed ? check.open + check.accepted + check.approved : check.open;

export function useAttendanceReview() {
  const t = useTranslations('attendanceReview');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const urlStart = searchParams.get('start') ?? '';
  const urlEnd = searchParams.get('end') ?? '';
  const hasUrlPeriod = urlStart !== '' && urlEnd !== '';
  const tab = parseTab(searchParams.get('tab'));
  const urlCode = searchParams.get('code') ?? '';

  const nextPeriodQuery = useQuery({
    queryKey: ['payrunNextPeriod'],
    queryFn: getNextPeriod,
    enabled: !hasUrlPeriod,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const nextPeriod = nextPeriodQuery.data?.data;
  const period = React.useMemo<ReviewPeriodRange | null>(() => {
    if (hasUrlPeriod) return { start: urlStart, end: urlEnd };
    if (nextPeriod?.period_start && nextPeriod?.period_end) {
      return { start: nextPeriod.period_start, end: nextPeriod.period_end };
    }
    if (nextPeriodQuery.isError) return fallbackPeriod();
    return null;
  }, [hasUrlPeriod, urlStart, urlEnd, nextPeriod, nextPeriodQuery.isError]);

  const periodError = period ? validatePeriod(period) : null;
  const activePeriod = period && !periodError ? period : null;

  const updateUrl = React.useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const setPeriod = (range: ReviewPeriodRange) => updateUrl({ start: range.start, end: range.end });
  const setTab = (value: string) => updateUrl({ tab: parseTab(value) });
  const setCode = (code: string) => updateUrl({ tab: 'issues', code });

  const [searchInput, setSearchInput] = React.useState('');
  const search = useDebounce(searchInput.trim(), 400);
  const [includeClosed, setIncludeClosed] = React.useState(false);
  const stateFilter: ReviewStateFilter = includeClosed ? 'all' : 'open';

  const summaryQuery = useQuery({
    queryKey: ['attendanceReview', 'summary', activePeriod?.start, activePeriod?.end],
    queryFn: () => getAttendanceReviewSummary(activePeriod!),
    enabled: !!activePeriod,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const summary = summaryQuery.data?.data;

  const checks = React.useMemo(() => summary?.by_check ?? [], [summary]);
  const firstOpenCode = (severity: ReviewSeverity) =>
    checks.find((check) => check.severity === severity && check.open > 0)?.code ?? null;

  // A deep-linked code is fetched right away; otherwise the first group with issues is shown.
  const effectiveCode =
    urlCode || checks.find((check) => groupCount(check, includeClosed) > 0)?.code || '';
  const selectedCheck = checks.find((check) => check.code === effectiveCode) ?? null;

  // Page resets to 1 whenever anything else in the issue query changes.
  const filterKey = [activePeriod?.start, activePeriod?.end, effectiveCode, stateFilter, search].join('|');
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 1 });
  const page = pageState.key === filterKey ? pageState.page : 1;
  const setPage = (value: number) => setPageState({ key: filterKey, page: Math.max(1, value) });

  const issuesQuery = useQuery({
    queryKey: [
      'attendanceReview',
      'issues',
      activePeriod?.start,
      activePeriod?.end,
      effectiveCode,
      stateFilter,
      search,
      page,
    ],
    queryFn: () =>
      getAttendanceReviewIssues(activePeriod!, {
        code: effectiveCode,
        state: stateFilter,
        search: search || undefined,
        page,
        per_page: ISSUES_PER_PAGE,
      }),
    // Wait for summary so we don't queue two heavy review calls on PHP's single worker.
    enabled: !!activePeriod && !!effectiveCode && !!summary,
    staleTime: 30_000,
    // Keep cards on screen only while paging or searching inside the same group.
    placeholderData: (previous: AttendanceReviewIssueListResponse | undefined, previousQuery) => {
      const key = previousQuery?.queryKey ?? [];
      const sameGroup =
        key[2] === activePeriod?.start &&
        key[3] === activePeriod?.end &&
        key[4] === effectiveCode &&
        key[5] === stateFilter;
      return sameGroup ? previous : undefined;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const issuesPagination = issuesQuery.data?.pagination;
  const lastPage = issuesPagination?.last_page ?? 1;
  React.useEffect(() => {
    if (issuesPagination && lastPage >= 1 && page > lastPage) {
      setPageState({ key: filterKey, page: lastPage });
    }
  }, [issuesPagination, lastPage, page, filterKey]);

  const invalidateReview = () => {
    queryClient.invalidateQueries({ queryKey: ['attendanceReview'] });
    queryClient.invalidateQueries({ queryKey: ['attendance'] });
    queryClient.invalidateQueries({ queryKey: ['attendanceStats'] });
    queryClient.invalidateQueries({ queryKey: ['attendanceDetail'] });
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['attendanceReview'] });
  };

  const [openBulkApprove, setOpenBulkApprove] = React.useState(false);
  const [acceptTarget, setAcceptTarget] = React.useState<AttendanceReviewIssue | null>(null);
  const [resolveUnresolvedTarget, setResolveUnresolvedTarget] = React.useState<AttendanceReviewIssue | null>(null);
  const [recordActionTarget, setRecordActionTarget] = React.useState<RecordActionTarget | null>(null);

  const bulkApproveMutation = useMutation({
    mutationFn: () =>
      postAttendanceReviewBulkApprove({
        start_date: activePeriod!.start,
        end_date: activePeriod!.end,
      }),
    onSuccess: (response) => {
      toast.success(
        t('bulkApproveSuccess', {
          approved: response.data?.approved ?? 0,
          remaining: response.data?.remaining_waiting ?? 0,
        }),
      );
      setOpenBulkApprove(false);
      invalidateReview();
    },
    onError: async (error) => toast.error(await getErrorMessage(error, t('bulkApproveFailed'))),
  });

  const acceptMutation = useMutation({
    mutationFn: ({ issue, note }: { issue: AttendanceReviewIssue; note: string }) =>
      postAttendanceReviewAcknowledgement({
        start_date: activePeriod!.start,
        end_date: activePeriod!.end,
        issue_key: issue.issue_key,
        note,
      }),
    onSuccess: () => {
      toast.success(t('acceptSuccess'));
      setAcceptTarget(null);
      invalidateReview();
    },
    onError: async (error) => toast.error(await getErrorMessage(error, t('acceptFailed'))),
  });

  const resolveUnresolvedMutation = useMutation({
    mutationFn: (items: ResolveUnresolvedItem[]) => postAttendanceReviewResolveUnresolved({ items }),
    onSuccess: (response) => {
      toast.success(t('resolveUnresolvedSuccess', { count: response.data?.resolved ?? 0 }));
      setResolveUnresolvedTarget(null);
      invalidateReview();
    },
    onError: async (error) => toast.error(await getErrorMessage(error, t('resolveUnresolvedFailed'))),
  });

  const recordActionMutation = useMutation({
    mutationFn: async ({ target, remarks }: { target: RecordActionTarget; remarks: string }) => {
      const { kind, record, issue } = target;
      if (record) {
        return putAttendanceStatus(record.id, {
          status: kind === 'reject' ? ATTENDANCE_STATUS_REJECTED : ATTENDANCE_STATUS_ABSENT,
          remarks,
        });
      }
      if (kind === 'mark_absent' && issue.employee && issue.date) {
        return postMarkAttendanceAbsent({
          user_id: issue.employee.user_id,
          attendance_date: issue.date,
          remarks,
        });
      }
      throw new Error(t('actionFailed'));
    },
    onSuccess: (_response, { target }) => {
      toast.success(target.kind === 'reject' ? t('rejectSuccess') : t('markAbsentSuccess'));
      setRecordActionTarget(null);
      invalidateReview();
    },
    onError: async (error) => toast.error(await getErrorMessage(error, t('actionFailed'))),
  });

  /** Current review view; edit pages come back here after saving. */
  const reviewHref = React.useMemo(() => {
    const params = new URLSearchParams();
    if (activePeriod) {
      params.set('start', activePeriod.start);
      params.set('end', activePeriod.end);
    }
    params.set('tab', tab);
    if (effectiveCode) params.set('code', effectiveCode);
    return `${REVIEW_PATH}?${params.toString()}`;
  }, [activePeriod, tab, effectiveCode]);

  const editHref = (issue: AttendanceReviewIssue, record: ReviewRecord) => {
    if (!issue.employee) return null;
    const returnTo = encodeURIComponent(reviewHref);
    return `/attendance/attendance-tracker/${issue.employee.user_id}/${record.id}?return_to=${returnTo}`;
  };

  const unresolvedHref = (issue: AttendanceReviewIssue) => {
    const param = (key: string) => (typeof issue.params[key] === 'string' ? (issue.params[key] as string) : '');
    const from = param('from') || issue.date || activePeriod?.start || '';
    const to = param('to') || issue.date || activePeriod?.end || '';
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString();
    return query ? `${UNRESOLVED_PUNCHES_PATH}?${query}` : UNRESOLVED_PUNCHES_PATH;
  };

  return {
    period,
    activePeriod,
    periodError,
    isPeriodLoading: !period && nextPeriodQuery.isLoading,
    usedFallbackPeriod: !hasUrlPeriod && nextPeriodQuery.isError,
    setPeriod,
    tab,
    setTab,
    summary,
    summaryQuery,
    checks,
    selectedCheck,
    effectiveCode,
    setCode,
    firstBlockerCode: firstOpenCode('blocker'),
    firstWarningCode: firstOpenCode('warning'),
    searchInput,
    setSearchInput,
    includeClosed,
    setIncludeClosed,
    issues: issuesQuery.data?.data ?? [],
    issuesQuery,
    issuesPagination,
    page,
    setPage,
    refresh,
    isRefreshing: summaryQuery.isFetching || issuesQuery.isFetching,
    openBulkApprove,
    setOpenBulkApprove,
    bulkApproveMutation,
    acceptTarget,
    setAcceptTarget,
    acceptMutation,
    resolveUnresolvedTarget,
    setResolveUnresolvedTarget,
    resolveUnresolvedMutation,
    recordActionTarget,
    setRecordActionTarget,
    recordActionMutation,
    editHref,
    unresolvedHref,
  };
}
