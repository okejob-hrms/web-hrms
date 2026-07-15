import { apiEmployee } from "@/lib/api";
import { ApiPagination, ApiResponse } from "@/lib/types";
import {
  IOKRDetailsResponse,
  IOKRResponse,
} from "@/services/okr/types";

export interface EssOkrCycleListResponse {
  status: string;
  message: string;
  data: IOKRResponse[];
  pagination: ApiPagination;
}

export const getEssOkrCycles = async (params?: {
  page?: number;
  per_page?: number;
}): Promise<EssOkrCycleListResponse> => {
  const searchParams: Record<string, string> = {};
  if (params?.page) searchParams.page = String(params.page);
  if (params?.per_page) searchParams.per_page = String(params.per_page);

  const response = await apiEmployee.get<EssOkrCycleListResponse>("ess/okr", {
    searchParams,
  });
  return response.json();
};

export const getEssOkrCycle = async (
  id: number,
): Promise<ApiResponse<IOKRDetailsResponse>> => {
  const response = await apiEmployee.get<ApiResponse<IOKRDetailsResponse>>(
    `ess/okr/${id}`,
  );
  return response.json();
};

export interface EssOkrTrackingPeriodRow {
  period_id: number;
  label: string;
  actual_value: number | null;
  target_value: number | null;
}

export interface EssOkrKeyResultTracking {
  id: number;
  title: string;
  start_value: number;
  current_value: number;
  target_value: number;
  progress: number;
  status_label: string;
  tracking_table?: EssOkrTrackingPeriodRow[];
}

export const getEssOkrKeyResultTracking = async (
  keyResultId: number,
): Promise<ApiResponse<EssOkrKeyResultTracking>> => {
  const response = await apiEmployee.get<ApiResponse<EssOkrKeyResultTracking>>(
    `ess/okr/${keyResultId}/tracking`,
  );
  return response.json();
};

export type EssOkrTrackingValuePayload = {
  key_result_id: number;
  tracking_period_id: number;
  actual_value: number;
};

export const setEssOkrTrackingValues = async (
  payload: EssOkrTrackingValuePayload[],
): Promise<ApiResponse<unknown>> => {
  const response = await apiEmployee.post<ApiResponse<unknown>>(
    "ess/okr/set-tracking-value",
    { json: payload },
  );
  return response.json();
};
