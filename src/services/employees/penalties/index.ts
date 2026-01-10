import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { IPenaltyResponse } from "./hook";

export const getPenalties = (userId?: number) => {
  const url = userId
    ? `employee/penalties?user_id=${userId}`
    : `employee/penalties`;
  const response =
    api.get<ApiResponse<PaginatedResponse<IPenaltyResponse>>>(url);
  return response.json();
};
