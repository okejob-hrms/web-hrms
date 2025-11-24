import { api } from "@/lib/api";
import { AdditionalRequest, AllowanceRequest, OvertimeRequest, PayrunViewResponse, PayslipResponse, PenaltyRequest, RequestPayrollGroup, ResponsePayrollDetail, ResponsePayrollList, WorkingHourRequest } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getPayroll = async (
  pagination?: PaginationState,
  filters?: { search?: string; period_year?: string; period_month?: string }
): Promise<ResponsePayrollList> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  if (filters?.search) {
    searchParams.search = filters.search;
  }

  if (filters?.period_year) {
    searchParams.period_year = filters.period_year;
  }

  if (filters?.period_month) {
    searchParams.period_month = filters.period_month;
  }

  const response = await api.get<ResponsePayrollList>(
    "payruns",
    { searchParams }
  );

  return response.json();
};

export const getPayrollDetail = async (id: string): Promise<ResponsePayrollDetail> => {
  const response = await api.get(`payruns/${id}`);
  return response.json<ResponsePayrollDetail>();
};

export const postPayrollGroup = async (
  payload: RequestPayrollGroup,
): Promise<ResponsePayrollList> => {
  return api
    .post(`payruns`, {
      json: payload,
    })
    .json<ResponsePayrollList>();
};


export const getPayrollEmployee = async (
  id: string,
  pagination?: PaginationState,
  filters?: { search?: string;}
): Promise<PayslipResponse> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  if (filters?.search) {
    searchParams.search = filters.search;
  }

  const response = await api.get<PayslipResponse>(
    `payruns/${id}/payslips`,
    { searchParams }
  );

  return response.json();
};

export const postFinalPayrun = async (
  id: string,
): Promise<ResponsePayrollList> => {
  return api
    .post(`payruns/${id}/set-final`, {
      json: {},
    })
    .json<ResponsePayrollList>();
};


export const putAllowancePayrun = async (
  id: string,
  payload: AllowanceRequest,
): Promise<ResponsePayrollList> => {
  return api
    .put(`payruns/${id}/payslips/allowances`, {
      json: payload,
    })
    .json<ResponsePayrollList>();
};

export const putWorkingHourPayrun = async (
  id: string,
  payload: WorkingHourRequest,
): Promise<ResponsePayrollList> => {
  return api
    .put(`payruns/${id}/payslips/working-hours`, {
      json: payload,
    })
    .json<ResponsePayrollList>();
};

export const putOvertimePayrun = async (
  id: string,
  payload: OvertimeRequest,
): Promise<ResponsePayrollList> => {
  return api
    .put(`payruns/${id}/payslips/overtime`, {
      json: payload,
    })
    .json<ResponsePayrollList>();
};

export const putAdditionalPayrun = async (
  id: string,
  payload: AdditionalRequest,
): Promise<ResponsePayrollList> => {
  return api
    .put(`payruns/${id}/payslips/additional-earning`, {
      json: payload,
    })
    .json<ResponsePayrollList>();
};

export const putPenaltyPayrun = async (
  id: string,
  payload: PenaltyRequest,
): Promise<ResponsePayrollList> => {
  return api
    .put(`payruns/${id}/payslips/penalties`, {
      json: payload,
    })
    .json<ResponsePayrollList>();
};

export const postRegenerate = async (
  id: string,
): Promise<ResponsePayrollList> => {
  return api
    .post(`payruns/${id}/retry-generate-payslips`, {
      json: {},
    })
    .json<ResponsePayrollList>();
};

export const getPayrollPrint = async (
  pagination?: PaginationState,
  filters?: { search?: string; period_year?: string; period_month?: string }
): Promise<PayrunViewResponse> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  if (filters?.search) {
    searchParams.search = filters.search;
  }

  if (filters?.period_year) {
    searchParams.period_year = filters.period_year;
  }

  if (filters?.period_month) {
    searchParams.period_month = filters.period_month;
  }

  const response = await api.get<PayrunViewResponse>(
    "payslip-print",
    { searchParams }
  );

  return response.json();
};

export const getPayrollView = async (
  pagination?: PaginationState,
  filters?: { search?: string; period_year?: string; period_month?: string }
): Promise<PayrunViewResponse> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  if (filters?.search) {
    searchParams.search = filters.search;
  }

  if (filters?.period_year) {
    searchParams.period_year = filters.period_year;
  }

  if (filters?.period_month) {
    searchParams.period_month = filters.period_month;
  }

  const response = await api.get<PayrunViewResponse>(
    "payslip-view",
    { searchParams }
  );

  return response.json();
};

export const putPrintPayrun = async (
  id: number,
  payload: {status: number},
): Promise<PayrunViewResponse> => {
  return api
    .put(`payslip-print/${id}/status`, {
      json: payload,
    })
    .json<PayrunViewResponse>();
};

export const putViewPayrun = async (
  id: number,
  payload: {status: number},
): Promise<PayrunViewResponse> => {
  return api
    .put(`payslip-view/${id}/status`, {
      json: payload,
    })
    .json<PayrunViewResponse>();
};
