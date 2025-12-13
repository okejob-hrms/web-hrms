import { api } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types";
import { IOKRResponse } from "./types";

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
