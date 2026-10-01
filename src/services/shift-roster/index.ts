import { api } from '@/lib/api';
import type { ApiPagination, ApiResponse } from '@/lib/types';

export type RosterShiftOption = { id: number; name: string };

export type RosterDaySource = 'team' | 'week' | 'day';

export type RosterMemberDay = {
  date: string;
  shift_id: number | null;
  shift_name: string | null;
  is_day_off: boolean;
  source: RosterDaySource;
};

export type RosterOverride = { shift_id: number | null; is_day_off: boolean };

export type RosterWeekMember = {
  employee_id: number;
  user_id: number | null;
  name: string | null;
  code: string | null;
  is_lead: boolean;
  schedule_type: 'roster' | 'fixed' | null;
  rostered: boolean;
  week_override: RosterOverride | null;
  days: RosterMemberDay[];
};

export type RosterWeekTeam = {
  koordinator_employee_id: number;
  koordinator_name: string | null;
  shift_id: number | null;
  shift_name: string | null;
  members: RosterWeekMember[];
};

export type RosterWeekStatus = 'draft' | 'published';

export type RosterWeekInfo = {
  id: number;
  week_start: string;
  week_end: string;
  status: RosterWeekStatus;
  owner_employee_id: number | null;
  owner_name: string | null;
  published_at: string | null;
  published_by_name: string | null;
  prefilled_from_id: number | null;
};

export type RosterChange = {
  id: number;
  action: 'edit' | 'publish';
  lines: string[];
  by: string | null;
  at: string | null;
};

export type RosterWeekView = {
  week: RosterWeekInfo | null;
  days: string[];
  shifts: RosterShiftOption[];
  teams: RosterWeekTeam[];
  history?: RosterChange[];
  editable: boolean;
};

export type RosterEditResult = {
  week_id: number;
  status: RosterWeekStatus;
  changed: boolean;
  materialised: {
    rows: number;
    added: number;
    removed: number;
    reresolved_employees: number;
    warnings: string[];
    conflicts: Array<Record<string, unknown>>;
  } | null;
};

export type RosterOverridePayload = {
  shift_id?: number | null;
  is_day_off?: boolean;
  clear?: boolean;
};

export type RosterWeekIndex = {
  week_start: string;
  owners: Array<{
    owner_employee_id: number;
    owner_name: string | null;
    teams: Array<{ koordinator_employee_id: number; koordinator_name: string | null; members_count: number }>;
    week_id: number | null;
    status: RosterWeekStatus | null;
  }>;
  teams_without_owner: Array<{
    koordinator_employee_id: number;
    koordinator_name: string | null;
    owner_status: string;
    supervisor_name: string | null;
    members_count: number;
    week_id: number | null;
    status: RosterWeekStatus | null;
  }>;
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

const base = 'setting/attendance/roster-weeks';

export const getRosterWeekIndex = async (weekStart: string) =>
  api.get(`${base}/by-week/${weekStart}`).json<ApiResponse<RosterWeekIndex>>();

export const getOwnerRosterWeek = async (weekStart: string, ownerId: number) =>
  api.get(`${base}/by-week/${weekStart}/owners/${ownerId}`).json<ApiResponse<RosterWeekView>>();

export const getOwnerlessTeamRosterWeek = async (weekStart: string, koordinatorId: number) =>
  api.get(`${base}/by-week/${weekStart}/teams/${koordinatorId}`).json<ApiResponse<RosterWeekView>>();

export const getRosterWeek = async (weekId: number) =>
  api.get(`${base}/${weekId}`).json<ApiResponse<RosterWeekView>>();

export const setRosterWeekTeam = async (weekId: number, koordinatorId: number, shiftId: number | null) =>
  api
    .put(`${base}/${weekId}/teams/${koordinatorId}`, { json: { shift_id: shiftId } })
    .json<ApiResponse<RosterEditResult>>();

export const setRosterWeekMember = async (weekId: number, employeeId: number, payload: RosterOverridePayload) =>
  api
    .put(`${base}/${weekId}/members/${employeeId}`, { json: payload })
    .json<ApiResponse<RosterEditResult>>();

export const setRosterWeekMemberDay = async (
  weekId: number,
  employeeId: number,
  date: string,
  payload: RosterOverridePayload,
) =>
  api
    .put(`${base}/${weekId}/members/${employeeId}/days/${date}`, { json: payload })
    .json<ApiResponse<RosterEditResult>>();

export const publishRosterWeek = async (weekId: number) =>
  api.post(`${base}/${weekId}/publish`).json<ApiResponse<RosterEditResult>>();

export const reresolveRoster = async (payload: { employee_id: number; from: string; to: string }) =>
  api.post('setting/attendance/roster-weeks/reresolve', { json: payload }).json<ApiResponse<Record<string, unknown>>>();

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
