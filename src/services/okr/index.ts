import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import {
  IOKRCycleRequest,
  IOKRDetailsResponse,
  IOKRKeyResultRequest,
  IOKRObjectiveRequest,
  IOKRResponse,
  IOKRTrackingPeriodRequest,
  IOKRTrackingPeriodsResponse,
} from "./types";

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

export const getOKRCycleDetails = async (
  id: number,
): Promise<ApiResponse<IOKRDetailsResponse>> => {
  try {
    const response = await api.get<ApiResponse<IOKRDetailsResponse>>(
      `okr/cycles/${id}`,
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

export const deleteOKRCycle = async (id: number): Promise<IOKRResponse> => {
  try {
    const response = await api.delete<IOKRResponse>(`okr/cycles/${id}`);
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
  params: IOKRObjectiveRequest,
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

export const updateOKRObjective = async (
  params: IOKRObjectiveRequest,
  id: number,
): Promise<IOKRResponse> => {
  try {
    const response = await api.put<IOKRResponse>(`okr/objectives/${id}`, {
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

export const createOKRKeyResult = async (
  params: IOKRKeyResultRequest,
): Promise<IOKRResponse> => {
  try {
    const response = await api.post<IOKRResponse>("okr/key-results", {
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

export const deleteOKRKeyResult = async (id: number): Promise<IOKRResponse> => {
  try {
    const response = await api.delete(`okr/key-results/${id}`);
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

export const getOKRTrackingPeriods = async (
  okrCycleId: number,
  periodType: string,
): Promise<ApiResponse<IOKRTrackingPeriodsResponse>> => {
  try {
    const response = await api.get<ApiResponse<IOKRTrackingPeriodsResponse>>(
      `okr/cycles/${okrCycleId}/tracking-periods?period_type=${periodType}`,
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

export const setOKRTrackingPeriods = async (
  id: number,
  params: IOKRTrackingPeriodRequest[],
): Promise<IOKRTrackingPeriodsResponse> => {
  try {
    const response = await api.post<IOKRTrackingPeriodsResponse>(
      `okr/cycles/${id}/tracking-periods`,
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
