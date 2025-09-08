import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { api } from "@/lib/api";
import qs from "qs";
import { IEmployeeDocumentResponse } from "./types";

interface Params {
  search?: string;
  department_ids?: number[];
  job_level_ids?: number[];
  job_position_ids?: number[];
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
  page?: number;
  per_page?: number;
}

export const deleteEmployeeDocument = (
  user_id: number,
  employee_doc_id: number,
): Promise<ApiResponse<IEmployeeDocumentResponse>> => {
  const response = api.delete<ApiResponse<IEmployeeDocumentResponse>>(
    `employees/${user_id}/documents/${employee_doc_id}`,
  );
  return response.json();
};

export const addEmployeeDocument = (
  user_id: number,
): Promise<ApiResponse<IEmployeeDocumentResponse>> => {
  const response = api.delete<ApiResponse<IEmployeeDocumentResponse>>(
    `employees/${user_id}/documents`,
  );
  return response.json();
};

export const updateEmployeeDocument = (
  user_id: number,
  employee_doc_id: number,
): Promise<ApiResponse<IEmployeeDocumentResponse>> => {
  const response = api.put<ApiResponse<IEmployeeDocumentResponse>>(
    `employees/${user_id}/documents/${employee_doc_id}`,
  );
  return response.json();
};

export const getAllEmployeeDocument = (
  user_id: number,
): Promise<PaginatedResponse<IEmployeeDocumentResponse>> => {
  const response = api.get<PaginatedResponse<IEmployeeDocumentResponse>>(
    `employees/${user_id}/documents`,
  );
  return response.json();
};
