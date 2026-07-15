import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { AllowanceTypes } from "./types";

export const getAllowanceTypes = async (): Promise<
  ApiResponse<AllowanceTypes[]>
> => {
  // Backend defaults to per_page=10; salary/adjustment selects need the full list.
  const response = await api.get<ApiResponse<AllowanceTypes[]>>(
    "allowance-types",
    {
      searchParams: {
        page: "1",
        per_page: "10000",
      },
    },
  );
  return response.json();
};
