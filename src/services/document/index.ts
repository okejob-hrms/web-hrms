import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { IEmployeeDocumentResponse } from "./types";

interface Params {
  attachments: {
    type: string;
    path: string;
  }[];
  user_id: number;
}

export const addEmployeeDocument = (
  params: Params,
): Promise<ApiResponse<IEmployeeDocumentResponse>> => {
  const response = api.post<ApiResponse<IEmployeeDocumentResponse>>(
    `employees/${params.user_id}/documents`,
    { json: { attachments: params.attachments } },
  );
  return response.json();
};

export const deleteEmployeeDocument = (
  user_id: number,
  employee_doc_id: number,
): Promise<ApiResponse<IEmployeeDocumentResponse>> => {
  const response = api.delete<ApiResponse<IEmployeeDocumentResponse>>(
    `employees/${user_id}/documents/${employee_doc_id}`,
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
