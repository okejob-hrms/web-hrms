/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import {
  IRolesResponse,
  IPermissionResponse,
  IEmployee,
  ICreateRolePayload,
  ICreateRoleResponse,
  IRoleDetailResponse,
  CompanyResponse,
  CompanyRequest,
  WorkScheduleResponse,
  AttendanceRequest,
  ShiftResponse,
  LateDeductions,
  DeductionRequest,
  ShiftByDayResponse,
  OvertimeApiModel,
  ICompanyBranches,
  IMutateCompanyBranchRequest,
} from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";

export const getRoles = async (): Promise<IRolesResponse> => {
  const response = await api.get("roles");
  return response.json();
};

export const getRoleById = async (id: number): Promise<IRoleDetailResponse> => {
  const response = await api.get(`roles/${id}`);
  return response.json<IRoleDetailResponse>();
};

export const getUserWithRole = async (
  id: number,
): Promise<PaginatedResponse<IEmployee>> => {
  const response = await api.get(`roles/${id}/users?per_pages=10000`);
  return response.json<PaginatedResponse<IEmployee>>();
};

export const getPermission = async (): Promise<IPermissionResponse> => {
  const response = await api.get<IPermissionResponse>("permissions");
  return response.json();
};

export const getEmployee = async (search: string): Promise<PaginatedResponse<IEmployee>> => {
  return api.get(`employees?search=${search}`).json<PaginatedResponse<IEmployee>>();
};

export const createRole = async (
  payload: ICreateRolePayload,
): Promise<ICreateRoleResponse> => {
  return api
    .post("roles", {
      json: payload,
    })
    .json<ICreateRoleResponse>();
};

export const updateRole = async (
  id: number,
  payload: ICreateRolePayload,
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
  payload: CompanyRequest,
): Promise<CompanyResponse> => {
  return api
    .put(`setting/company-profile`, {
      json: payload,
    })
    .json<CompanyResponse>();
};

export const getWorkingSchedule = async (branch_id: string): Promise<WorkScheduleResponse> => {
  const response = await api.get(`setting/attendance/working-schedules/${branch_id}`);
  return response.json();
};

export const getShift = async (): Promise<ShiftResponse> => {
  const response = await api.get("setting/shift");
  return response.json();
};

export const updateAttendanceTime = async (
  branch: string,
  payload: AttendanceRequest,
): Promise<WorkScheduleResponse> => {
  return api
    .post(`setting/attendance/working-schedules/${branch}`, {
      json: payload,
    })
    .json<WorkScheduleResponse>();
};

export const getLateDeduction = async (): Promise<
  PaginatedResponse<LateDeductions>
> => {
  return api
    .get("setting/late-deduction")
    .json<PaginatedResponse<LateDeductions>>();
};

export const postDeduction = async (
  payload: DeductionRequest,
): Promise<PaginatedResponse<LateDeductions>> => {
  return api
    .post(`setting/late-deduction`, {
      json: payload,
    })
    .json<PaginatedResponse<LateDeductions>>();
};

export const putDeduction = async (
  id: number,
  payload: DeductionRequest,
): Promise<PaginatedResponse<LateDeductions>> => {
  return api
    .put(`setting/late-deduction/${id}`, {
      json: payload,
    })
    .json<PaginatedResponse<LateDeductions>>();
};

export const removeDeduction = async (
  id: number,
): Promise<PaginatedResponse<LateDeductions>> => {
  return api
    .delete(`setting/late-deduction/${id}`, {
      json: {},
    })
    .json<PaginatedResponse<LateDeductions>>();
};

export const getOvertimeConfig = async (): Promise<OvertimeApiModel> => {
  const response = await api.get<OvertimeApiModel>(
    "employee/overtime/configuration",
  );
  return response.json();
};

export const getShiftToday = async (
  date: string,
): Promise<ShiftByDayResponse> => {
  const response = await api.get(`setting/shift/shift-date?date=${date}`);
  return response.json();
};

export const postOvertimeConfig = async (
  payload: OvertimeApiModel,
): Promise<OvertimeApiModel> => {
  return api
    .post(`employee/overtime/configuration`, {
      json: payload,
    })
    .json<OvertimeApiModel>();
};

export const getBranches = async (): Promise<
  PaginatedResponse<ICompanyBranches>
> => {
  try {
    return api
      .get(`setting/branch`)
      .json<PaginatedResponse<ICompanyBranches>>();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};

export const getBranchDetails = async (
  id: number,
): Promise<ApiResponse<ICompanyBranches>> => {
  try {
    return api
      .get(`setting/branch/${id}`)
      .json<ApiResponse<ICompanyBranches>>();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};

export const postAddBranch = async (
  params: IMutateCompanyBranchRequest,
): Promise<ApiResponse<ICompanyBranches>> => {
  try {
    return api
      .post(`setting/branch`, { json: params })
      .json<ApiResponse<ICompanyBranches>>();
  } catch (error: any) {
    if (error.name === "HTTPError") {
      const errorResponse = await error.response.json();
      const enhancedError = new Error(error.message);
      (enhancedError as any).response = {
        json: () => Promise.resolve(errorResponse),
        status: error.response.status,
      };
      throw enhancedError;
    }
    throw error;
  }
};
