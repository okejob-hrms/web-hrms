import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IEquipmentFacilityHandoverRequest,
  IWorkAndHandoverResponse,
  IWorkDocumentHandoverRequest,
} from "./types";
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
    `employee/offboardings/${params.offboarding_id}/handover-asset-return?category=${params.category ?? "work"}`,
  );
  return response.json();
};

export const deleteHandoverAssetsReturn = async (
  params: Params,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  const response = await api.delete<ApiResponse<IWorkAndHandoverResponse>>(
    `employee/offboardings/${params.offboarding_id}/handover-asset-return/${params.handover_item_id}`,
  );
  return response.json();
};

export const storeWorkDocumentHandover = async (
  offboarding_id: number,
  params: IWorkDocumentHandoverRequest,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  const response = await api.post<ApiResponse<IWorkAndHandoverResponse>>(
    `employee/offboardings/${offboarding_id}/handover-asset-return`,
    { json: params },
  );
  return response.json();
};

export const storeEquipmentFacilityHandover = async (
  offboarding_id: number,
  params: IEquipmentFacilityHandoverRequest,
): Promise<ApiResponse<IWorkAndHandoverResponse>> => {
  const response = await api.post<ApiResponse<IWorkAndHandoverResponse>>(
    `employee/offboardings/${offboarding_id}/handover-asset-return`,
    { json: params },
  );
  return response.json();
};
