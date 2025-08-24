import { api } from "@/lib/api";
import { IRolesResponse, IPermissionResponse, IEmployeeModule } from "./types";

export const getRoles = async (): Promise<IRolesResponse> => {
  const response = await api.get("roles");
  return response.json();
};

export const getPermission = async (): Promise<IPermissionResponse> => {
  const response = await api.get<IPermissionResponse>("permissions");
  return response.json();
};

export const getEmployee = async (): Promise<IEmployeeModule> => {
  const response = await api.get<IEmployeeModule>("employees");
  return response.json();
};