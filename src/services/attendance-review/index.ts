import { api } from '@/lib/api';
import {
  AcknowledgeIssuePayload,
  AcknowledgeIssueResponse,
  AttendanceReviewIssueListResponse,
  AttendanceReviewSummaryResponse,
  BulkApprovePayload,
  BulkApproveResponse,
  ResolveUnresolvedPayload,
  ResolveUnresolvedResponse,
  ReviewIssueFilters,
  ReviewPeriodRange,
} from './types';

// Live recompute of ~500 employees × 31 days; PHP's single-threaded `artisan serve` on
// Windows also queues behind other API calls, so keep this well above the happy-path ~3s.
const REVIEW_TIMEOUT_MS = 120_000;

const periodParams = (period: ReviewPeriodRange): Record<string, string> => ({
  start_date: period.start,
  end_date: period.end,
});

export const getAttendanceReviewSummary = async (
  period: ReviewPeriodRange,
): Promise<AttendanceReviewSummaryResponse> => {
  return api
    .get('employee/attendance-review', {
      searchParams: periodParams(period),
      timeout: REVIEW_TIMEOUT_MS,
    })
    .json<AttendanceReviewSummaryResponse>();
};

export const getAttendanceReviewIssues = async (
  period: ReviewPeriodRange,
  filters: ReviewIssueFilters = {},
): Promise<AttendanceReviewIssueListResponse> => {
  const searchParams = periodParams(period);

  if (filters.code) searchParams.code = filters.code;
  if (filters.severity) searchParams.severity = filters.severity;
  if (filters.state) searchParams.state = filters.state;
  if (filters.branch_id) searchParams.branch_id = String(filters.branch_id);
  if (filters.search) searchParams.search = filters.search;
  if (filters.page) searchParams.page = String(filters.page);
  if (filters.per_page) searchParams.per_page = String(filters.per_page);

  return api
    .get('employee/attendance-review/issues', {
      searchParams,
      timeout: REVIEW_TIMEOUT_MS,
    })
    .json<AttendanceReviewIssueListResponse>();
};

export const postAttendanceReviewBulkApprove = async (
  payload: BulkApprovePayload,
): Promise<BulkApproveResponse> => {
  return api
    .post('employee/attendance-review/bulk-approve', {
      json: payload,
      timeout: REVIEW_TIMEOUT_MS,
    })
    .json<BulkApproveResponse>();
};

export const postAttendanceReviewAcknowledgement = async (
  payload: AcknowledgeIssuePayload,
): Promise<AcknowledgeIssueResponse> => {
  return api
    .post('employee/attendance-review/acknowledgements', {
      json: { ...payload, note: payload.note.trim() },
      timeout: REVIEW_TIMEOUT_MS,
    })
    .json<AcknowledgeIssueResponse>();
};

export const postAttendanceReviewResolveUnresolved = async (
  payload: ResolveUnresolvedPayload,
): Promise<ResolveUnresolvedResponse> => {
  return api
    .post('employee/attendance-review/unresolved-punches/resolve', {
      json: payload,
      timeout: REVIEW_TIMEOUT_MS,
    })
    .json<ResolveUnresolvedResponse>();
};

export const exportAttendanceReviewExcel = async (
  period: ReviewPeriodRange,
): Promise<Blob> => {
  try {
    const response = await api.get('employee/attendance-review/export', {
      searchParams: periodParams(period),
      timeout: REVIEW_TIMEOUT_MS,
    });
    const blob = await response.blob();

    // Shared api Accepts JSON; a misconfigured 2xx JSON body must not download as .xlsx
    if (blob.type.includes('json')) {
      let message = 'Failed to export attendance review';
      try {
        const errorResponse = JSON.parse(await blob.text()) as { message?: string };
        if (errorResponse?.message) {
          message = errorResponse.message;
        }
      } catch {
        // body may not be JSON despite content-type
      }
      throw new Error(message);
    }

    return blob;
  } catch (error: unknown) {
    const httpError = error as { name?: string; response?: Response };
    if (httpError?.name === 'HTTPError' && httpError.response) {
      let message = 'Failed to export attendance review';
      try {
        const errorResponse = (await httpError.response.json()) as { message?: string };
        if (errorResponse?.message) {
          message = errorResponse.message;
        }
      } catch {
        // response body may not be JSON
      }
      throw new Error(message);
    }
    throw error;
  }
};
