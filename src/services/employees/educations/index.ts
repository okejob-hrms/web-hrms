/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import qs from "qs";
import {
  IFormalEducationForm,
  IEducationResponse,
  INonFormalEducationForm,
} from "./types";

interface Params {
  employee_profile_id?: number;
  payload?: IFormalEducationForm | INonFormalEducationForm;
  search?: string;
  id?: number;
}

export const postCreateEducation = async (
  params: Params,
): Promise<ApiResponse<IEducationResponse>> => {
  try {
    const response = await api.post<ApiResponse<IEducationResponse>>(
      `employees/${params.employee_profile_id ? `${params.employee_profile_id}/` : ""}educations`,
      { json: params.payload },
    );
    return response.json();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
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

export const putUpdateEducation = async (
  params: Params,
): Promise<ApiResponse<IEducationResponse>> => {
  try {
    const response = await api.put<ApiResponse<IEducationResponse>>(
      `employees/${params.employee_profile_id}/educations/${params.id}`,
      { json: params.payload },
    );
    return response.json();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};

export const deleteEducation = async (
  params: Params,
): Promise<ApiResponse<IEducationResponse>> => {
  const response = await api.delete<ApiResponse<IEducationResponse>>(
    `employees/${params.employee_profile_id}/educations/${params.id}`,
    { json: params.payload },
  );
  return response.json();
};
