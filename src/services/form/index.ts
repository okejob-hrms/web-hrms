/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IFormTemplate,
  IFormTemplateParams,
  IMutateFormRequest,
  IMutateFieldRequest,
  IFormGroup,
} from "./types";

export const getAllForm = async (): Promise<
  PaginatedResponse<IFormTemplate>
> => {
  try {
    const response = await api.get<PaginatedResponse<IFormTemplate>>(`forms`);
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
): Promise<PaginatedResponse<IFormTemplate>> => {
  try {
    const response = await api.get<PaginatedResponse<IFormTemplate>>(
      `form/field`,
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
