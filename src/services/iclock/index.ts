import { api } from '@/lib/api';
import { ApiResponse } from '@/lib/types';
import type {
  IclockBackfillResult,
  IclockDevice,
  IclockHealth,
  IclockLog,
  IclockReconcileReport,
  IclockReprocessRangeResult,
  IclockUnmatchedPin,
} from './types';

/** ADMS round-trips (login + scrape) often exceed the default 10s ky timeout. */
const ADMS_TIMEOUT_MS = 90_000;
/** Day-chunk scrape / bulk rebuild can run for several minutes. */
const ADMS_REPAIR_TIMEOUT_MS = 300_000;

type LogsParams = {
  pin?: string;
  device?: string;
  status?: string | number;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
};

export const getIclockHealth = async (): Promise<ApiResponse<IclockHealth>> => {
  return api.get('setting/iclock/health').json();
};

export const getIclockDevices = async (): Promise<ApiResponse<IclockDevice[]>> => {
  return api.get('setting/iclock/devices').json();
};

export const syncIclockDevices = async (): Promise<ApiResponse<{ synced: number; devices: IclockDevice[] }>> => {
  return api.post('setting/iclock/devices/sync', { json: {}, timeout: ADMS_TIMEOUT_MS }).json();
};

export const getIclockLogs = async (params: LogsParams = {}) => {
  const searchParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams[key] = String(value);
    }
  });
  return api.get('setting/iclock/logs', { searchParams }).json<ApiResponse<{
    data: IclockLog[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  }>>();
};

export const getIclockUnmatched = async (): Promise<ApiResponse<IclockUnmatchedPin[]>> => {
  return api.get('setting/iclock/unmatched').json();
};

export const triggerIclockSync = async (payload: { sync?: boolean; dry_run?: boolean } = {}) => {
  return api
    .post('setting/iclock/sync', { json: payload, timeout: ADMS_TIMEOUT_MS })
    .json<ApiResponse<Record<string, number | boolean>>>();
};

export const reconcileIclock = async (payload: {
  from: string;
  to: string;
  device?: string;
  pin?: string;
}) => {
  return api
    .post('setting/iclock/reconcile', { json: payload, timeout: ADMS_REPAIR_TIMEOUT_MS })
    .json<ApiResponse<IclockReconcileReport>>();
};

export const backfillIclock = async (payload: {
  from: string;
  to: string;
  device?: string;
  pin?: string;
  dry_run?: boolean;
  confirm?: boolean;
  rebuild_all?: boolean;
}) => {
  return api
    .post('setting/iclock/backfill', { json: payload, timeout: ADMS_REPAIR_TIMEOUT_MS })
    .json<ApiResponse<IclockBackfillResult>>();
};

export const reprocessIclock = async (
  payload:
    | {
        date: string;
        pin?: string;
        employee_id?: number;
        dry_run?: boolean;
      }
    | {
        from: string;
        to: string;
        pin?: string;
        dry_run?: boolean;
        confirm?: boolean;
      },
) => {
  return api
    .post('setting/iclock/reprocess', { json: payload, timeout: ADMS_REPAIR_TIMEOUT_MS })
    .json<ApiResponse<Record<string, unknown> | IclockReprocessRangeResult>>();
};
