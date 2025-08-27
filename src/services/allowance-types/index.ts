import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { AllowanceTypes } from "./types";

export const getAllowanceTypes = async (): Promise<
  ApiResponse<PaginatedResponse<AllowanceTypes>>
> => {
  const response = await api.get<
    ApiResponse<PaginatedResponse<AllowanceTypes>>
  >(
    "allowance-types",
    // JSON.stringify(payload),
  );
  return response.json();
};
