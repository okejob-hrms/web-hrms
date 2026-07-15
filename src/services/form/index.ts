/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, apiEmployee } from "@/lib/api";
import { ApiPagination, ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IFormTemplate,
  IFormTemplateParams,
  IMutateFormRequest,
  IMutateFieldRequest,
  IFormGroup,
  IFormField,
  FormFieldData,
  IExitFormRequest,
  IHandoverRequest,
  IFieldResponse,
  IFormListParams,
} from "./types";

export interface IFormListResponse extends ApiResponse<IFormTemplate[]> {
  pagination?: ApiPagination;
}

export const getAllForm = async (
  params?: IFormListParams,
): Promise<IFormListResponse> => {
  try {
    const searchParams: Record<string, string> = {};

    // Only send pagination when the caller asks for it. Omitting page/per_page
    // lets the API return the full list (needed for select/dropdown loads).
    // Forced per_page defaults like 10000 are rejected (API max is 100).
    if (params?.page !== undefined) {
      searchParams.page = String(params.page);
    }
    if (params?.per_page !== undefined) {
      searchParams.per_page = String(params.per_page);
    }
    if (params?.search) {
      searchParams.search = params.search;
    }
    if (params?.type !== undefined) {
      searchParams.type = String(params.type);
    }
    if (params?.sort_by) {
      searchParams.sort_by = params.sort_by;
    }
    if (params?.sort_dir) {
      searchParams.sort_dir = params.sort_dir;
    }

    const response = await api.get<IFormListResponse>(`forms`, {
      searchParams: Object.keys(searchParams).length > 0 ? searchParams : undefined,
    });
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

export const getFields = async (
  params: IFormTemplateParams,
): Promise<PaginatedResponse<IFieldResponse>> => {
  try {
    const response = await api.get<PaginatedResponse<IFieldResponse>>(
      params.form_id ? `form/field?form_id=${params.form_id}` : `form/field`,
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

export const getFieldsByGroup = async (
  group_id: number,
): Promise<PaginatedResponse<IFormGroup>> => {
  try {
    const response = await api.get<PaginatedResponse<IFormGroup>>(
      `form/field/group`,
      { body: JSON.stringify({ group_id }) },
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

export const postCreateForm = async (
  params: IMutateFormRequest,
): Promise<ApiResponse<IFormTemplate>> => {
  try {
    const response = await api.post<ApiResponse<IFormTemplate>>(`forms`, {
      json: params,
    });
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

export const postUpdateForm = async (
  form_id: number,
  params: IMutateFormRequest,
): Promise<ApiResponse<IFormTemplate>> => {
  try {
    const response = await api.put<ApiResponse<IFormTemplate>>(
      `forms/${form_id}`,
      {
        json: params,
      },
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

export const postAddField = async (
  form_id: number,
  params: IMutateFieldRequest,
): Promise<ApiResponse<IFormTemplate>> => {
  try {
    const response = await api.post<ApiResponse<IFormTemplate>>(
      `forms/${form_id}/fields`,
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

export const deleteForm = async (
  form_id: number,
): Promise<ApiResponse<IFormTemplate>> => {
  try {
    const response = await api.delete<ApiResponse<IFormTemplate>>(
      `forms/${form_id}`,
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

export const getFormById = async (
  form_id: number,
): Promise<ApiResponse<IFormTemplate>> => {
  try {
    const response = await api.get<ApiResponse<IFormTemplate>>(
      `forms/${form_id}`,
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