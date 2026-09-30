import { apiEmployee } from '@/lib/api';
import type { ApiResponse } from '@/lib/types';
import type {
  RosterCalendar,
  ShiftPattern,
  ShiftPatternAssignment,
} from '@/services/shift-roster';

export type TeamRosterMeta = {
  has_team: boolean;
  team_size: number;
  supervisor_employee_id: number | null;
};

export type TeamRosterCalendar = RosterCalendar & {
  editable_from: string;
  shifts: Array<{ id: number; name: string }>;
};

type PatternPayload = {
  name: string;
  cycle_length_days: number;
  is_active?: boolean;
  days: Array<{ day_index: number; shift_id: number | null }>;
};

export const getTeamRosterMeta = async () =>
  apiEmployee.get('ess/team-roster/meta').json<ApiResponse<TeamRosterMeta>>();

export const getTeamRoster = async (month: string) =>
  apiEmployee
    .get('ess/team-roster', { searchParams: { month } })
    .json<ApiResponse<TeamRosterCalendar>>();

export const setTeamRosterCell = async (payload: {
  employee_id: number;
  date: string;
  shift_id?: number | null;
  is_day_off?: boolean;
  clear?: boolean;
}) => apiEmployee.post('ess/team-roster/cell', { json: payload }).json<ApiResponse<null>>();

export const bulkAssignTeamRoster = async (payload: {
  employee_ids: number[];
  from: string;
  to: string;
  shift_id?: number | null;
  is_day_off?: boolean;
  on_conflict?: 'skip' | 'overwrite';
}) =>
  apiEmployee
    .post('ess/team-roster/bulk', { json: payload })
    .json<ApiResponse<{ created: number; conflicts: Array<Record<string, unknown>> }>>();

export const getTeamPatterns = async () =>
  apiEmployee.get('ess/team-roster/patterns').json<ApiResponse<ShiftPattern[]>>();

export const createTeamPattern = async (payload: PatternPayload) =>
  apiEmployee.post('ess/team-roster/patterns', { json: payload }).json<ApiResponse<ShiftPattern>>();

export const updateTeamPattern = async (id: number, payload: Partial<PatternPayload>) =>
  apiEmployee
    .put(`ess/team-roster/patterns/${id}`, { json: payload })
    .json<ApiResponse<ShiftPattern>>();

export const deleteTeamPattern = async (id: number) =>
  apiEmployee.delete(`ess/team-roster/patterns/${id}`).json<ApiResponse<null>>();

export const assignTeamPattern = async (
  id: number,
  payload: {
    employee_ids: number[];
    anchor_date: string;
    effective_from: string;
    effective_to?: string | null;
  },
) =>
  apiEmployee
    .post(`ess/team-roster/patterns/${id}/assign`, { json: payload })
    .json<ApiResponse<unknown>>();

export const getTeamPatternAssignments = async (id: number) =>
  apiEmployee
    .get(`ess/team-roster/patterns/${id}/assignments`)
    .json<ApiResponse<ShiftPatternAssignment[]>>();

export const endTeamPatternAssignment = async (assignmentId: number, effective_to?: string) =>
  apiEmployee
    .post(`ess/team-roster/pattern-assignments/${assignmentId}/end`, {
      json: effective_to ? { effective_to } : {},
    })
    .json<ApiResponse<ShiftPatternAssignment>>();
