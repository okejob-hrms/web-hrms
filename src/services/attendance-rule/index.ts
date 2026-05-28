import { api } from '@/lib/api';
import { ApiResponse } from '@/lib/types';
import {
  AttendanceRule,
  AttendanceRuleListParams,
  AttendanceRuleListResponse,
  AttendanceRuleRequest,
} from './types';

const BASE_PATH = 'setting/attendance-rule';

export const getAttendanceRules = async (
  params?: AttendanceRuleListParams,
): Promise<AttendanceRuleListResponse> => {
  const searchParams: Record<string, string> = {};

  if (params?.page) searchParams.page = String(params.page);
  if (params?.limit) searchParams.limit = String(params.limit);
  if (params?.search) searchParams.search = params.search;
  if (params?.condition_type)
    searchParams.condition_type = params.condition_type;
  if (params?.trigger_type) searchParams.trigger_type = params.trigger_type;
  if (params?.is_active !== undefined)
    searchParams.is_active = String(params.is_active);

  const response = await api.get<AttendanceRuleListResponse>(BASE_PATH, {
    searchParams,
  });
  return response.json();
};

export const getAttendanceRuleById = async (
  id: number,
): Promise<ApiResponse<AttendanceRule>> => {
  const response = await api.get<ApiResponse<AttendanceRule>>(
    `${BASE_PATH}/${id}`,
  );
  return response.json();
};

export const postAttendanceRule = async (
  payload: AttendanceRuleRequest,
): Promise<ApiResponse<AttendanceRule>> => {
  return api
    .post(BASE_PATH, { json: payload })
    .json<ApiResponse<AttendanceRule>>();
};

export const putAttendanceRule = async (
  id: number,
  payload: AttendanceRuleRequest,
): Promise<ApiResponse<AttendanceRule>> => {
  return api
    .put(`${BASE_PATH}/${id}`, { json: payload })
    .json<ApiResponse<AttendanceRule>>();
};

export const deleteAttendanceRule = async (
  id: number,
): Promise<ApiResponse<null>> => {
  return api
    .delete(`${BASE_PATH}/${id}`, { json: {} })
    .json<ApiResponse<null>>();
};
