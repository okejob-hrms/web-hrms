import { api } from "@/lib/api";
import { 
  DeductionSalaryItem, 
  DeductionSalaryItemType, 
  DeductionSalaryItemTypeList, 
  IParamSearch, 
  RequestAllowance, 
  RequestBaseSalary, 
  RequestDeductionSalary, 
  ResponseAllowance, 
  ResponseBaseSalary, 
  ResponseDeductionSalary,
} from "./types";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import qs from "qs";

export const getAllowance = async (): Promise<ResponseAllowance> => {
  const response = await api.get("allowance-types");
  return response.json();
};

export const getAllowanceById = async (
  id: number,
): Promise<ResponseAllowance> => {
  const response = await api.get(`allowance-types/${id}`);
  return response.json<ResponseAllowance>();
};

export const postAllowance = async (
  payload: RequestAllowance,
): Promise<ResponseAllowance> => {
  return api
    .post(`allowance-types`, {
      json: payload,
    })
    .json<ResponseAllowance>();
};

export const putAllowance = async (
  id: number,
  payload: RequestAllowance,
): Promise<ResponseAllowance> => {
  return api
    .put(`allowance-types/${id}`, {
      json: payload,
    })
    .json<ResponseAllowance>();
};

export const removeAllowance = async (
  id: number,
): Promise<ResponseAllowance> => {
  return api
    .delete(`allowance-types/${id}`, {
      json: {},
    })
    .json<ResponseAllowance>();
};

export const getBaseSalary = async (
  search?: IParamSearch,
): Promise<ResponseBaseSalary> => {
  const response = await api.get(
    search ? `base-salaries?${qs.stringify(search)}` : "base-salaries",
  );
  return response.json();
};

export const postBaseSalary = async (
  payload: RequestBaseSalary,
): Promise<ResponseBaseSalary> => {
  return api
    .post(`base-salaries`, {
      json: payload,
    })
    .json<ResponseBaseSalary>();
};

export const putBaseSalary = async (
  id: number,
  payload: RequestBaseSalary,
): Promise<ResponseBaseSalary> => {
  return api
    .put(`base-salaries/${id}`, {
      json: payload,
    })
    .json<ResponseBaseSalary>();
};

export const removeBaseSalary = async (
  id: number,
): Promise<ResponseBaseSalary> => {
  return api
    .delete(`base-salaries/${id}`, {
      json: {},
    })
    .json<ResponseBaseSalary>();
};

export const getDeductionSalary = async (): Promise<
  ApiResponse<PaginatedResponse<DeductionSalaryItem>>
> => {
  const response = await api.get("setting/salary-deduction");
  return response.json();
};

export const postDeductionSalary = async (
  payload: RequestDeductionSalary,
): Promise<ApiResponse<PaginatedResponse<DeductionSalaryItem>>> => {
  return api
    .post(`setting/salary-deduction`, {
      json: payload,
    })
    .json<ApiResponse<PaginatedResponse<DeductionSalaryItem>>>();
};

export const putDeductionSalary = async (
  id: number,
  payload: RequestDeductionSalary,
): Promise<ApiResponse<PaginatedResponse<DeductionSalaryItem>>> => {
  return api
    .put(`setting/salary-deduction/${id}`, {
      json: payload,
    })
    .json<ApiResponse<PaginatedResponse<DeductionSalaryItem>>>();
};

export const removeDeductionSalary = async (
  id: number,
): Promise<ApiResponse<PaginatedResponse<DeductionSalaryItem>>> => {
  return api
    .delete(`setting/salary-deduction/${id}`, {
      json: {},
    })
    .json<ApiResponse<PaginatedResponse<DeductionSalaryItem>>>();
};

export const getDeductionSalaryType = async (): Promise<DeductionSalaryItemTypeList> => {
  const response = await api.get("setting/deduction-types");
  return response.json();
};
