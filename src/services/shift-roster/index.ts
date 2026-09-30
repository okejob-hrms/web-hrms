import { api } from '@/lib/api';
import type { ApiPagination, ApiResponse } from '@/lib/types';

export type RosterCell = {
  id: number;
  shift_id: number | null;
  shift_name: string | null;
  is_day_off: boolean;
  source: string;
  updated_by_name?: string | null;
  updated_at?: string | null;
};

export type RosterCalendar = {
  employees: Array<{
    id: number;
    user_id: number;
    name: string | null;
    code: string | null;
    branch_id?: number | null;
    branch_name?: string | null;
  }>;
  dates: string[];
  cells: Record<number, Record<string, RosterCell[]>>;
};

export type UnresolvedPunch = {
  id: number;
  employee_id: number | null;
  punched_at: string;
  unresolved_reason: string | null;
  pin?: string | null;
  device_sn?: string | null;
  employee?: {
    id: number;
    code?: string | null;
    user?: { id: number; name: string } | null;
    branch?: { id: number; name: string } | null;
  } | null;
};

export const getRosterCalendar = async (branchId: number, month: string) => {
  return api
    .get('setting/attendance/roster', {
      searchParams: { branch_id: String(branchId), month },
    })
    .json<ApiResponse<RosterCalendar>>();
};

export const setRosterCell = async (payload: {
  employee_id: number;
  date: string;
  shift_id?: number | null;
  is_day_off?: boolean;
  clear?: boolean;
}) => {
  return api.post('setting/attendance/roster/cell', { json: payload }).json<ApiResponse<null>>();
};

export const bulkAssignRoster = async (payload: {
  employee_ids: number[];
  from: string;
  to: string;
  shift_id?: number | null;
  is_day_off?: boolean;
  on_conflict?: 'skip' | 'overwrite';
}) => {
  return api
    .post('setting/attendance/roster/bulk', { json: payload })
    .json<ApiResponse<{ created: number; conflicts: Array<Record<string, unknown>> }>>();
};

export const reresolveRoster = async (payload: {
  employee_id: number;
  from: string;
  to: string;
}) => {
  return api
    .post('setting/attendance/roster/reresolve', { json: payload })
    .json<ApiResponse<Record<string, unknown>>>();
};

export const getUnresolvedPunches = async (params: {
  branch_id?: number;
  reason?: string;
  from?: string;
  to?: string;
  page?: number;
}) => {
  const searchParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams[key] = String(value);
    }
  });
  return api.get('setting/attendance/unresolved-punches', { searchParams }).json<
    ApiResponse<UnresolvedPunch[]> & {
      pagination?: ApiPagination;
    }
  >();
};

export const assignUnresolvedPunch = async (
  id: number,
  payload: { counted_date: string; shift_id: number },
) => {
  return api
    .post(`setting/attendance/unresolved-punches/${id}/assign`, { json: payload })
    .json<ApiResponse<UnresolvedPunch>>();
};

export const discardUnresolvedPunch = async (id: number, reason?: string) => {
  return api
    .post(`setting/attendance/unresolved-punches/${id}/discard`, {
      json: { reason: reason ?? undefined },
    })
    .json<ApiResponse<UnresolvedPunch>>();
};
