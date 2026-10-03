import { apiEmployee } from '@/lib/api';
import type { ApiResponse } from '@/lib/types';
import type {
  RosterEditResult,
  RosterOverridePayload,
  RosterWeekView,
} from '@/services/shift-roster';

export type TeamRosterRole = 'owner' | 'team_lead' | 'none';

export type TeamRosterMeta = {
  role: TeamRosterRole;
  has_team: boolean;
  teams_count: number;
  current_week_start: string;
  next_week_start: string;
  /** Preferred picker start: current week if unpublished, else next week. */
  default_week_start?: string;
};

const base = 'ess/team-roster';

export const getTeamRosterMeta = async () =>
  apiEmployee.get(`${base}/meta`).json<ApiResponse<TeamRosterMeta>>();

export const getTeamRosterWeek = async (weekStart: string) =>
  apiEmployee.get(`${base}/weeks/${weekStart}`).json<ApiResponse<RosterWeekView>>();

export const setTeamRosterTeam = async (weekStart: string, koordinatorId: number, shiftId: number | null) =>
  apiEmployee
    .put(`${base}/weeks/${weekStart}/teams/${koordinatorId}`, { json: { shift_id: shiftId } })
    .json<ApiResponse<RosterEditResult>>();

export const setTeamRosterMember = async (weekStart: string, employeeId: number, payload: RosterOverridePayload) =>
  apiEmployee
    .put(`${base}/weeks/${weekStart}/members/${employeeId}`, { json: payload })
    .json<ApiResponse<RosterEditResult>>();

export const setTeamRosterMemberDay = async (
  weekStart: string,
  employeeId: number,
  date: string,
  payload: RosterOverridePayload,
) =>
  apiEmployee
    .put(`${base}/weeks/${weekStart}/members/${employeeId}/days/${date}`, { json: payload })
    .json<ApiResponse<RosterEditResult>>();

export const publishTeamRosterWeek = async (weekStart: string) =>
  apiEmployee.post(`${base}/weeks/${weekStart}/publish`).json<ApiResponse<RosterEditResult>>();
