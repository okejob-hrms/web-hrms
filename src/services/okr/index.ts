import { api } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types";
import { IOKRCycleRequest, IOKRResponse } from "./types";

export const getOKRCycles = async (): Promise<
  PaginatedResponse<IOKRResponse>
> => {
  try {
    const response =
      await api.get<PaginatedResponse<IOKRResponse>>("okr/cycles");
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

export const createOKRCycle = async (
  params: IOKRCycleRequest,
): Promise<IOKRResponse> => {
  try {
    const response = await api.post<IOKRResponse>("okr/cycles", {
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

export const updateOKRCycle = async (
  id: number,
  params: IOKRCycleRequest,
): Promise<IOKRResponse> => {
  try {
    const response = await api.put<IOKRResponse>(`okr/cycles/${id}`, {
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

export const getOKRObjectives = async (): Promise<
  PaginatedResponse<IOKRResponse>
> => {
  try {
    const response =
      await api.get<PaginatedResponse<IOKRResponse>>("okr/objectives");
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

export const createOKRObjective = async (
  params: IOKRCycleRequest,
): Promise<IOKRResponse> => {
  try {
    const response = await api.post<IOKRResponse>("okr/objectives", {
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