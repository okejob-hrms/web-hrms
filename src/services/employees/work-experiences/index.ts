import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import qs from "qs";
import { IResponseWorkExperience, IWorkExperienceForm } from "./types";

interface Params {
  employee_profile_id: number;
  payload?: IWorkExperienceForm;
  search?: string;
}

export const postCreateWorkExperience = async (
  params: Params,
): Promise<ApiResponse<IResponseWorkExperience>> => {
  const response = await api.post<ApiResponse<IResponseWorkExperience>>(
    `employees/${params.employee_profile_id}/work-experiences`,
    { json: params.payload },
  );
  return response.json();
};

export const getWorkExperiences = async (
  params: Params,
): Promise<ApiResponse<PaginatedResponse<IResponseWorkExperience>>> => {
  const response = await api.get<
    ApiResponse<PaginatedResponse<IResponseWorkExperience>>
  >(
    `employees/${params.employee_profile_id}/work-experiences${params.search ? qs.stringify({ search: params.search }, { encodeValuesOnly: true }) : ""}`,
  );
  return response.json();
};
