// services/auth.ts
import { api, apiPublic } from "@/lib/api";
import { ApiResponse } from "@/lib/types";
import { IChangePasswordRequest, IChangePasswordResponse, ILoginRequest, ILoginResponse, IResetPasswordRequest, IResetPasswordResponse, IResetRequest, IResetResponse } from "./types";

export const postLogin = async (
  payload: ILoginRequest,
): Promise<ApiResponse<ILoginResponse>> => {
  const response = await apiPublic.post<ApiResponse<ILoginResponse>>("login", {
    json: payload,
  });
  return response.json();
};


export const postRequestReset = async (
  payload: IResetRequest,
): Promise<ApiResponse<IResetResponse>> => {
  const response = await apiPublic.post<ApiResponse<IResetResponse>>("password/forgot", {
    json: payload,
  });
  return response.json();
};

export const postResetPassword = async (
  payload: IResetPasswordRequest,
): Promise<ApiResponse<IResetPasswordResponse>> => {
  const response = await apiPublic.post<ApiResponse<IResetPasswordResponse>>("password/reset", {
    json: payload,
  });
  return response.json();
};

export const postChangePassword = async (
  payload: IChangePasswordRequest,
): Promise<ApiResponse<IChangePasswordResponse>> => {
  const response = await api.post<ApiResponse<IChangePasswordResponse>>("password/change", {
    json: payload,
  });
  return response.json();
};
