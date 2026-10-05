import { api } from '@/lib/api';
import type { ApiResponse } from '@/lib/types';

export type ScheduleType = 'roster' | 'fixed';

export type ScheduleTypeRow = {
  employee_id: number;
  code: string | null;
  name: string | null;
  branch_id: number | null;
  branch_name: string | null;
  job_position_id: number | null;
  job_position_name: string | null;
  job_level_id: number | null;
  job_level_name: string | null;
  current: ScheduleType | null;
  proposed: ScheduleType;
  overridden: boolean;
  team_lead_id: number | null;
  action: 'keep' | 'change' | 'overridden';
};

export type ScheduleTypePreview = {
  summary: { employees: number; changes: number; overridden: number };
  rows: ScheduleTypeRow[];
};

export type RosterTeamRow = {
  lead: { id: number; name: string | null; branch_id: number | null; branch_name: string | null };
  member_count: number;
  member_ids: number[];
  owner_status: string;
  owner: { id: number; name: string | null } | null;
  supervisor: { id: number; name: string | null; job_level_id: number | null } | null;
};

export type RosterSettings = {
  team_lead_job_level_ids: number[];
  owner_job_level_ids: number[];
  job_levels: Array<{ id: number; name: string }>;
  shifts: Array<{ id: number; name: string }>;
  branches: Array<{ id: number; name: string; uses_shift_roster: boolean; default_shift_id: number | null }>;
};

export type RosterSettingsPayload = {
  team_lead_job_level_ids?: number[];
  owner_job_level_ids?: number[];
  branches?: Array<{ id: number; uses_shift_roster: boolean; default_shift_id: number | null }>;
};

const base = 'setting/attendance';

export const getScheduleTypePreview = async () =>
  api.get(`${base}/schedule-types/preview`).json<ApiResponse<ScheduleTypePreview>>();

export const applyScheduleTypes = async () =>
  api.post(`${base}/schedule-types/apply`).json<ApiResponse<Record<string, number>>>();

export const overrideScheduleType = async (employeeId: number, scheduleType: ScheduleType) =>
  api
    .put(`${base}/schedule-types/${employeeId}`, { json: { schedule_type: scheduleType } })
    .json<ApiResponse<{ id: number; schedule_type: ScheduleType; schedule_type_overridden: boolean }>>();

export const clearScheduleTypeOverride = async (employeeId: number) =>
  api
    .delete(`${base}/schedule-types/${employeeId}/override`)
    .json<ApiResponse<{ id: number; schedule_type: ScheduleType; schedule_type_overridden: boolean }>>();

export const getRosterTeams = async (withoutOwner = false) =>
  api
    .get(`${base}/roster-teams`, { searchParams: withoutOwner ? { without_owner: '1' } : {} })
    .json<ApiResponse<RosterTeamRow[]>>();

export const getRosterSettings = async () =>
  api.get(`${base}/roster-settings`).json<ApiResponse<RosterSettings>>();

export const updateRosterSettings = async (payload: RosterSettingsPayload) =>
  api.put(`${base}/roster-settings`, { json: payload }).json<ApiResponse<RosterSettings>>();
