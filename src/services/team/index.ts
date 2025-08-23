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
  let searchParams = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams = {
      page: page.toString(),
      per_page: per_page.toString(),
    };
  }

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
