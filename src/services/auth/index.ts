// services/auth.ts
import { apiPublic } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { ILoginRequest, ILoginResponse } from "./types";

export const postLogin = async (
  payload: ILoginRequest,
): Promise<ApiResponse<ILoginResponse>> => {
  const response = await apiPublic.post<ApiResponse<ILoginResponse>>("login", {
    json: payload,
  });
  return response.json();
};
