import { api } from "@/lib/api";
import { AdditionalList, AdditionalListDetail, AgeListDataResponse, AgeStatResponse, AttendanceStatResponse, AttListStatResponse, AttStatResponse, DataOffboardingTrendResponse, EmployeeStatResponse, ExperienceStatResponse, ExperienceTrend, ExpTrendListDataResponse, GenderStatResponse, OffboardingResponse, PayrollDashboardResponse, PendingResponse } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getPendingStat = async (): Promise<PendingResponse> => {
  const response = await api.get<PendingResponse>("dashboard/pending/stat");
  return response.json();
};

export const getOffboardingStat = async (
  filters: { start_date?: string; end_date?: string }
): Promise<OffboardingResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.start_date) {
    searchParams.start_date = filters.start_date
  }

  if (filters.end_date) {
    searchParams.end_date = filters.end_date
  }

  const response = await api.get<OffboardingResponse>(
    'dashboard/offboarding/trend',
    { searchParams }
  )

  return response.json()
}

export const getOffboardingList = async (
  pagination?: PaginationState,
  search?: string,
): Promise<DataOffboardingTrendResponse> => {
  const searchParams: Record<string, string> = {}

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1)
    searchParams.per_page = String(pagination.pageSize)
  }

  if (search?.trim()) {
    searchParams.search = search
  }

  const response = await api.get<DataOffboardingTrendResponse>(
    'dashboard/offboarding/recent',
    { searchParams }
  )

  return response.json()
}

export const getAttendanceStat = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<AttendanceStatResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<AttendanceStatResponse>(
    'dashboard/analytic/attendance-trend',
    { searchParams }
  )

  return response.json()
}

export const getEmployeeStat = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<EmployeeStatResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<EmployeeStatResponse>(
    'dashboard/analytic/total-employee',
    { searchParams }
  )

  return response.json()
}

export const getExperienceStat = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<ExperienceStatResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<ExperienceStatResponse>(
    'dashboard/analytic/experience-employee',
    { searchParams }
  )

  return response.json()
}

export const getAgeStat = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<AgeStatResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<AgeStatResponse>(
    'dashboard/analytic/age-spread',
    { searchParams }
  )

  return response.json()
}

export const getGenderStat = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<GenderStatResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<GenderStatResponse>(
    'dashboard/analytic/gender',
    { searchParams }
  )

  return response.json()
}

export const getAttStat = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<AttStatResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<AttStatResponse>(
    'dashboard/analytic/attendance-stats',
    { searchParams }
  )

  return response.json()
}

export const getAttStatList = async (
  pagination?: PaginationState,
  search?: string,
): Promise<AttListStatResponse> => {
  const searchParams: Record<string, string> = {}

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1)
    searchParams.per_page = String(pagination.pageSize)
  }

  if (search?.trim()) {
    searchParams.search = search
  }

  const response = await api.get<AttListStatResponse>(
    'dashboard/analytic/attendance-employee',
    { searchParams }
  )

  return response.json()
}

export const getExperienceTrend = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<ExperienceTrend> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<ExperienceTrend>(
    'dashboard/analytic/experience-employee-trend',
    { searchParams }
  )

  return response.json()
}

export const getExpStatList = async (
  pagination?: PaginationState,
  search?: string,
): Promise<ExpTrendListDataResponse> => {
  const searchParams: Record<string, string> = {}

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1)
    searchParams.per_page = String(pagination.pageSize)
  }

  if (search?.trim()) {
    searchParams.search = search
  }

  const response = await api.get<ExpTrendListDataResponse>(
    'dashboard/analytic/experience-employee-detail',
    { searchParams }
  )

  return response.json()
}

export const getAdditionalList = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<AdditionalList> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<AdditionalList>(
    'dashboard/analytic/additional',
    { searchParams }
  )

  return response.json()
}

export const getAdditionalListDetail = async (
  pagination?: PaginationState,
  search?: string,
  typeAdditional?:string,
): Promise<AdditionalListDetail> => {
  const searchParams: Record<string, string> = {}

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1)
    searchParams.per_page = String(pagination.pageSize)
  }

  if (search?.trim()) {
    searchParams.search = search
  }

  if (typeAdditional) {
    searchParams.type = typeAdditional
  }

  const response = await api.get<AdditionalListDetail>(
    `dashboard/analytic/additional-detail`,
    { searchParams }
  )

  return response.json()
}

export const getPayrollDashboard = async (
  filters: { branch_id?: string; department_id?: string }
): Promise<PayrollDashboardResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.branch_id) {
    searchParams.start_date = filters.branch_id
  }

  if (filters.department_id) {
    searchParams.end_date = filters.department_id
  }

  const response = await api.get<PayrollDashboardResponse>(
    'dashboard/payroll/stat',
  )

  return response.json()
}

export const getAgeStatList = async (
  pagination?: PaginationState,
  search?: string,
): Promise<AgeListDataResponse> => {
  const searchParams: Record<string, string> = {}

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1)
    searchParams.per_page = String(pagination.pageSize)
  }

  if (search?.trim()) {
    searchParams.search = search
  }

  const response = await api.get<AgeListDataResponse>(
    'dashboard/analytic/age-spread-detail',
    { searchParams }
  )

  return response.json()
}