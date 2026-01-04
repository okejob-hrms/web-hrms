import { api } from "@/lib/api";
import { OkrDashboardResponse } from "./types";
import { HTTPError } from "ky";

export const getOKRDashboard = async (
  id: number,
): Promise<OkrDashboardResponse> => {
  try {
    return await api
      .get(`okr/cycles/${id}/graph`)
      .json<OkrDashboardResponse>();
  } catch (error: unknown) {
    if (error instanceof HTTPError) {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);

      (enhancedError as Error & { response?: unknown }).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };

      throw enhancedError;
    }

    throw error;
  }
};
