import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { IInterviewScheduleRequest, IInterviewScheduleResponse } from "./types";

export const postInterviewSchedule = async (
  offboarding_id: number,
  params: IInterviewScheduleRequest,
): Promise<ApiResponse<IInterviewScheduleResponse>> => {
  const response = await api.post<ApiResponse<IInterviewScheduleResponse>>(
    `employee/offboardings/${offboarding_id}/schedule`,
    { json: params },
  );
  return response.json();
};

export const getInterviewSchedule = async (
  offboarding_id: number,
): Promise<ApiResponse<IInterviewScheduleResponse>> => {
  const response = await api.get<ApiResponse<IInterviewScheduleResponse>>(
    `employee/offboardings/${offboarding_id}/schedule`,
  );
  return response.json();
};
