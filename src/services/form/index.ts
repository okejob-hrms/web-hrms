/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types";
import { IFormTemplate, IFormTemplateParams } from "./types";

export const getAllForm = async (): Promise<
  PaginatedResponse<IFormTemplate>
> => {
  try {
    const response = await api.get<PaginatedResponse<IFormTemplate>>(`form`);
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

export const postAddFormField = async (
  params: IFormTemplateParams,
): Promise<PaginatedResponse<IFormTemplate>> => {
  try {
    const response = await api.post<PaginatedResponse<IFormTemplate>>(
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
