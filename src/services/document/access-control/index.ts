/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, apiPublic } from "@/lib/api";
import { IManageAccessDocumentResponse } from "./types";
import { ApiResponse } from "@/lib/types";

interface Params {
  employee_document_id: number;
  access_level: string;
  link_enabled: boolean;
  granteeables?: {
    granteeable_type: string;
    granteeable_id: number;
  }[];
}

export const postManageAccessDocument = async (
  params: Params,
): Promise<ApiResponse<IManageAccessDocumentResponse>> => {
  try {
    const response = api.post<ApiResponse<IManageAccessDocumentResponse>>(
      `documents/access-control`,
      { json: params },
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

export const getManageAccessDocument = async (
  id: number,
): Promise<ApiResponse<IManageAccessDocumentResponse>> => {
  try {
    const response = api.get<ApiResponse<IManageAccessDocumentResponse>>(
      `documents/access-control/${id}`,
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

export const getSharedDocument = async (
  token: string,
): Promise<
  ApiResponse<{
    id: number;
    filename: string;
    mime_type: string;
    size: number;
    type: string;
    download_url: string;
    uploaded_by?: { id: number; name: string };
    uploaded_at?: string;
  }>
> => {
  const response = apiPublic.get(`documents/shared/${token}`);
  return response.json();
};
