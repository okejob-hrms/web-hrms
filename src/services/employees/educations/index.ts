import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import qs from "qs";
import { IEducationForm, IEducationResponse } from "./types";

interface Params {
  employee_profile_id: number;
  payload?: IEducationForm;
  search?: string;
}

export const postCreateEducation = async (
  params: Params,
): Promise<ApiResponse<IEducationResponse>> => {
  const response = await api.post<ApiResponse<IEducationResponse>>(
    `employees/${params.employee_profile_id}/educations`,
    { json: params.payload },
  );
  return response.json();
};

export const getEducations = async (
  params: Params,
): Promise<ApiResponse<PaginatedResponse<IEducationResponse>>> => {
  const response = await api.get<
    ApiResponse<PaginatedResponse<IEducationResponse>>
  >(
    `employees/${params.employee_profile_id}/educations${params.search ? qs.stringify({ search: params.search }, { encodeValuesOnly: true }) : ""}`,
  );
  return response.json();
};
