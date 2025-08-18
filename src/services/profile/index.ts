import { api } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { IUserResponse } from "./types";

export const getProfile = async (): Promise<ApiResponse<IUserResponse>> => {
  const response = api.get<ApiResponse<IUserResponse>>("user/profile");
  return response.json();
};
