import { apiEmployee } from '@/lib/api';
import type { ApiResponse } from '@/lib/types';
import type { RosterCalendar } from '@/services/shift-roster';

export type TeamRosterMeta = {
  has_team: boolean;
  team_size: number;
  supervisor_employee_id: number | null;
};

export type TeamRosterCalendar = RosterCalendar & {
  editable_from: string;
  shifts: Array<{ id: number; name: string }>;
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
