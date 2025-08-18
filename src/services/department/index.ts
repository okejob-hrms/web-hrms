import { api } from "@/lib/api";
import { DepartmentResponse, IDepartmentForm } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";

export const postDepartment = async (
  payload: IDepartmentForm,
): Promise<ApiResponse<DepartmentResponse>> => {
  const response = await api.post<ApiResponse<DepartmentResponse>>(
    "departments",
    { json: payload },
  );
  return response.json();
};

export const getDepartment = async (): Promise<
  ApiResponse<PaginatedResponse<DepartmentResponse>>
> => {
  const response = await api.get<
    ApiResponse<PaginatedResponse<DepartmentResponse>>
  >(
    "departments",
    // JSON.stringify(payload),
  );
  return response.json();
};
