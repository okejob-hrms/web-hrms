import { api } from "@/lib/api";
import { IFamilyResponse, IFamilyForm } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import qs from "qs";

interface Params {
  employee_profile_id: number;
  payload?: IFamilyForm;
  search?: string;
}

export const postCreateFamily = async (
  params: Params,
): Promise<ApiResponse<IFamilyResponse>> => {
  const response = await api.post<ApiResponse<IFamilyResponse>>(
    `employees/${params.employee_profile_id}/families`,
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
