import { api } from "@/lib/api";
import { TeamResponse, ITeamForm } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import { PaginationState } from "@tanstack/react-table";

export const postTeam = async (
  payload: ITeamForm,
): Promise<ApiResponse<TeamResponse>> => {
  const response = await api.post<ApiResponse<TeamResponse>>("teams", {
    json: payload,
  });
  return response.json();
};

export const getTeam = async (
  pagination?: PaginationState,
): Promise<ApiResponse<PaginatedResponse<TeamResponse>>> => {
  // Backend defaults to per_page=10; bare getTeam() is used by dropdown MultiSelects.
  const searchParams = pagination
    ? {
        page: (pagination.pageIndex + 1).toString(),
        per_page: pagination.pageSize.toString(),
      }
    : {
        page: "1",
        per_page: "10000",
      };

  const response = await api.get<ApiResponse<PaginatedResponse<TeamResponse>>>(
    "teams",
    {
      searchParams,
    },
  );

  return response.json();
};

export const putTeam = async ({
  id,
  payload,
}: {
  id: number;
  payload: ITeamForm;
}): Promise<ApiResponse<TeamResponse>> => {
  const response = await api.put<ApiResponse<TeamResponse>>(`teams/${id}`, {
    json: payload,
  });
  return response.json();
};

export const deleteTeam = async ({
  id,
}: {
  id: number;
}): Promise<ApiResponse<TeamResponse>> => {
  const response = await api.delete<ApiResponse<null>>(`teams/${id}`);
  return response.json();
};
