import { api } from "@/lib/api";
import { DepartmentResponse, IDepartmentForm } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { PaginationState } from "@tanstack/react-table";

export const postDepartment = async (
  payload: IDepartmentForm,
): Promise<ApiResponse<DepartmentResponse>> => {
  const response = await api.post<ApiResponse<DepartmentResponse>>(
    "departments",
    { json: payload },
  );
  return response.json();
};

export const getDepartment = async (
  pagination?: PaginationState,
): Promise<ApiResponse<PaginatedResponse<DepartmentResponse>>> => {
  let searchParams = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams = {
      page: page.toString(),
      per_page: per_page.toString(),
    };
  }
  const response = await api.get<
    ApiResponse<PaginatedResponse<DepartmentResponse>>
  >("departments", {
    searchParams,
  });
  return response.json();
};

export const putDepartment = async ({
  id,
  payload,
}: {
  id: number;
  payload: IDepartmentForm;
}): Promise<ApiResponse<DepartmentResponse>> => {
  const response = await api.put<ApiResponse<DepartmentResponse>>(
    `departments/${id}`,
    { json: payload },
  );
  return response.json();
};

export const deleteDepartment = async ({
  id,
}: {
  id: number;
}): Promise<ApiResponse<DepartmentResponse>> => {
  const response = await api.delete<ApiResponse<null>>(`departments/${id}`);
  return response.json();
};
