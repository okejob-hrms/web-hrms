import { api } from "@/lib/api";
import { IFamilyResponse, IFamilyForm } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import qs from "qs";

interface Params {
  employee_profile_id?: number;
  payload?: IFamilyForm;
  search?: string;
  id?: number;
}

export const postCreateFamily = async (
  params: Params,
): Promise<ApiResponse<IFamilyResponse>> => {
  const response = await api.post<ApiResponse<IFamilyResponse>>(
    `employees/${params.employee_profile_id ? `${params.employee_profile_id}/` : ""}families`,
    { json: params.payload },
  );
  return response.json();
};

export const putUpdateFamily = async (
  params: Params,
): Promise<ApiResponse<IFamilyResponse>> => {
  const response = await api.put<ApiResponse<IFamilyResponse>>(
    `employees/${params.employee_profile_id}/families/${params.id}`,
    { json: params.payload },
  );
  return response.json();
};

export const getFamilies = async (
  params: Params,
): Promise<ApiResponse<PaginatedResponse<IFamilyResponse>>> => {
  const response = await api.get<
    ApiResponse<PaginatedResponse<IFamilyResponse>>
  >(
    `employees/${params.employee_profile_id}/families${params.search ? qs.stringify({ search: params.search }, { encodeValuesOnly: true }) : ""}`,
  );
  return response.json();
};

export const deleteFamily = async (
  params: Params,
): Promise<ApiResponse<IFamilyResponse>> => {
  const response = await api.delete<ApiResponse<IFamilyResponse>>(
    `employees/${params.employee_profile_id}/families/${params.id}`,
    { json: params.payload },
  );
  return response.json();
};
