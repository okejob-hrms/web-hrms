import { ApiResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { IEmployeeDocumentResponse, IEmployeeDocumentVersion } from "./types";

interface Params {
  attachments: {
    type: string;
    path: string;
  }[];
  user_id: number;
}

export const addEmployeeDocument = (
  params: Params,
): Promise<ApiResponse<IEmployeeDocumentResponse[]>> => {
  const response = api.post<ApiResponse<IEmployeeDocumentResponse[]>>(
    `employees/${params.user_id}/documents`,
    { json: { attachments: params.attachments } },
  );
  return response.json();
};

export const deleteEmployeeDocument = (
  user_id: number,
  employee_doc_id: number,
): Promise<ApiResponse<null>> => {
  const response = api.delete<ApiResponse<null>>(
    `employees/${user_id}/documents/${employee_doc_id}`,
  );
  return response.json();
};

export const updateEmployeeDocument = (
  user_id: number,
  employee_doc_id: number,
  body: { type: string; path: string },
): Promise<ApiResponse<IEmployeeDocumentResponse>> => {
  const response = api.put<ApiResponse<IEmployeeDocumentResponse>>(
    `employees/${user_id}/documents/${employee_doc_id}`,
    { json: body },
  );
  return response.json();
};

export const getAllEmployeeDocument = (
  user_id: number,
): Promise<ApiResponse<IEmployeeDocumentResponse[]>> => {
  const response = api.get<ApiResponse<IEmployeeDocumentResponse[]>>(
    `employees/${user_id}/documents`,
  );
  return response.json();
};

export const getEmployeeDocumentVersions = (
  user_id: number,
  document_id: number,
): Promise<ApiResponse<IEmployeeDocumentVersion[]>> => {
  const response = api.get<ApiResponse<IEmployeeDocumentVersion[]>>(
    `employees/${user_id}/documents/${document_id}/versions`,
  );
  return response.json();
};
