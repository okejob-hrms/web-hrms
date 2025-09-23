import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { IWorkAndHandoverResponse } from "./types";
import { api } from "@/lib/api";

interface Params {
  offboarding_id: number;
  category?: string;
  handover_item_id?: number;
}

export const getHandoverAssetsReturn = async (
  params: Params,
): Promise<ApiResponse<PaginatedResponse<IWorkAndHandoverResponse>>> => {
  const response = await api.get<
    ApiResponse<PaginatedResponse<IWorkAndHandoverResponse>>
  >(
    `employee/offboardings/${params.offboarding_id}/handover-assets-return?category=${params.category ?? "work"}`,
  );
  return response.json();
};

export const deleteHandoverAssetsReturn = async (
  params: Params,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  const response = await api.get<ApiResponse<IWorkAndHandoverResponse>>(
    `employee/offboardings/${params.offboarding_id}/handover-assets-return/${params.handover_item_id}`,
  );
  return response.json();
};
