import { api } from "@/lib/api";
import { TeamResponse, ITeamForm } from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";

export const postTeam = async (payload: ITeamForm) => {
  const response = await api.post("teams", { json: payload });
  return response;
};

export const getTeam = async (): Promise<
  ApiResponse<PaginatedResponse<TeamResponse>>
> => {
  const response = await api.get<ApiResponse<PaginatedResponse<TeamResponse>>>(
    "teams",
    // JSON.stringify(payload),
  );
  return response.json();
};
