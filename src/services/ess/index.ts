import { apiEmployee } from "@/lib/api";
import { DashboardAttendanceResponse, WaitingResponse } from "./types";

export const getAttendanceDashboardEmployee = async (
  filters: { start_date?: string; end_date?: string }
): Promise<DashboardAttendanceResponse> => {
  const searchParams: Record<string, string> = {}

  if (filters.start_date) {
    searchParams.start_date = filters.start_date
  }

  if (filters.end_date) {
    searchParams.end_date = filters.end_date
  }

  const response = await apiEmployee.get<DashboardAttendanceResponse>(
    'emdash/attendance-trend',
    { searchParams }
  )

  return response.json()
}

export const getWaitingDashboardEmployee = async (): Promise<WaitingResponse> => {
  const response = await apiEmployee.get<WaitingResponse>(
    'emdash/waiting-for-approval',
  )

  return response.json()
}