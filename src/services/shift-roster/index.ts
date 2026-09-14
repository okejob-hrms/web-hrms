import { api } from '@/lib/api';
import type { ApiPagination, ApiResponse } from '@/lib/types';

export type RosterCell = {
  id: number;
  shift_id: number | null;
  shift_name: string | null;
  is_day_off: boolean;
  source: string;
};

export type RosterCalendar = {
  employees: Array<{
    id: number;
    user_id: number;
    name: string | null;
    code: string | null;
  }>;
  dates: string[];
  cells: Record<number, Record<string, RosterCell[]>>;
};

export type ShiftPatternDay = {
  id?: number;
  day_index: number;
  shift_id: number | null;
  shift?: { id: number; name: string } | null;
};

export type ShiftPattern = {
  id: number;
  name: string;
  branch_id: number | null;
  cycle_length_days: number;
  is_active: boolean;
  branch?: { id: number; name: string } | null;
  days: ShiftPatternDay[];
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

export type ShiftPatternAssignment = {
  id: number;
  pattern_id: number;
  employee_id: number;
  anchor_date: string;
  effective_from: string;
  effective_to: string | null;
  employee?: {
    id: number;
    code?: string | null;
    user?: { id: number; name: string } | null;
  } | null;
};

export const getShiftPatterns = async (branchId?: number) => {
  const searchParams: Record<string, string> = {};
  if (branchId) searchParams.branch_id = String(branchId);
  return api
    .get('setting/attendance/shift-patterns', { searchParams })
    .json<ApiResponse<ShiftPattern[]>>();
};

export const createShiftPattern = async (payload: {
  name: string;
  branch_id?: number | null;
  cycle_length_days: number;
  is_active?: boolean;
  days: Array<{ day_index: number; shift_id: number | null }>;
}) => {
  return api
    .post('setting/attendance/shift-patterns', { json: payload })
    .json<ApiResponse<ShiftPattern>>();
};

export const updateShiftPattern = async (
  id: number,
  payload: Partial<{
    name: string;
    branch_id: number | null;
    cycle_length_days: number;
    is_active: boolean;
    days: Array<{ day_index: number; shift_id: number | null }>;
  }>,
) => {
  return api
    .put(`setting/attendance/shift-patterns/${id}`, { json: payload })
    .json<ApiResponse<ShiftPattern>>();
};

export const deleteShiftPattern = async (id: number) => {
  return api.delete(`setting/attendance/shift-patterns/${id}`).json<ApiResponse<null>>();
};

export const assignShiftPattern = async (payload: {
  pattern_id: number;
  employee_ids: number[];
  anchor_date: string;
  effective_from: string;
  effective_to?: string | null;
}) => {
  return api
    .post('setting/attendance/shift-patterns/assign', { json: payload })
    .json<ApiResponse<unknown>>();
};

export const regenerateShiftPatterns = async (payload: {
  pattern_id?: number;
  branch_id?: number;
  days?: number;
}) => {
  return api
    .post('setting/attendance/shift-patterns/regenerate', { json: payload })
    .json<ApiResponse<Record<string, unknown>>>();
};

export const getShiftPatternAssignments = async (patternId: number) => {
  return api
    .get(`setting/attendance/shift-patterns/${patternId}/assignments`)
    .json<ApiResponse<ShiftPatternAssignment[]>>();
};

export const endShiftPatternAssignment = async (
  assignmentId: number,
  payload?: { effective_to?: string | null },
) => {
  return api
    .post(`setting/attendance/shift-patterns/assignments/${assignmentId}/end`, {
      json: payload ?? {},
    })
    .json<ApiResponse<ShiftPatternAssignment>>();
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
