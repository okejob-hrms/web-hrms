import { api } from "@/lib/api";
import { IRolesResponse, IPermissionResponse, IEmployee, ICreateRolePayload, ICreateRoleResponse, IRoleDetailResponse, CompanyResponse, CompanyRequest } from "./types";
import { PaginatedResponse } from "@/lib/types";

export const getRoles = async (): Promise<IRolesResponse> => {
  const response = await api.get("roles");
  return response.json();
};

export const getRoleById = async (id: number): Promise<IRoleDetailResponse> => {
  const response = await api.get(`roles/${id}`);
  return response.json<IRoleDetailResponse>();
};

export const getUserWithRole = async (id: number): Promise<PaginatedResponse<IEmployee>> => {
  const response = await api.get(`roles/${id}/users?per_pages=10000`);
  return response.json<PaginatedResponse<IEmployee>>();
};

export const getPermission = async (): Promise<IPermissionResponse> => {
  const response = await api.get<IPermissionResponse>("permissions");
  return response.json();
};

export const getEmployee = async (): Promise<PaginatedResponse<IEmployee>> => {
  return api.get("employees").json<PaginatedResponse<IEmployee>>();
};

export const createRole = async (
  payload: ICreateRolePayload
): Promise<ICreateRoleResponse> => {
  return api
    .post("roles", {
      json: payload,
    })
    .json<ICreateRoleResponse>();
};

export const updateRole = async (
  id: number,
  payload: ICreateRolePayload
): Promise<ICreateRoleResponse> => {
  return api
    .put(`roles/${id}`, {
      json: payload,
    })
    .json<ICreateRoleResponse>();
};

export const getCompanyProfile = async (): Promise<CompanyResponse> => {
  const response = await api.get("setting/company-profile");
  return response.json();
};

export const updateCompanyProfile = async (
  payload: CompanyRequest
): Promise<CompanyResponse> => {
  return api
    .put(`setting/company-profile`, {
      json: payload,
    })
    .json<CompanyResponse>();
};