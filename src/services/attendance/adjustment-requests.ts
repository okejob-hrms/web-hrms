import { api } from '@/lib/api';
import { PaginationState } from '@tanstack/react-table';

export interface AttendanceAdjustmentRequest {
  id: number;
  user_id: number;
  attendance_id: number;
  attendance_date?: string;
  shift_id?: number | null;
  shift_name?: string | null;
  clock_in_at?: string | null;
  clock_out_at?: string | null;
  notes?: string | null;
  status: number;
  status_label: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    employee_code?: string | null;
  };
}

export interface AttendanceAdjustmentRequestListResponse {
  status: string;
  message: string;
  data: AttendanceAdjustmentRequest[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next: string | null;
    prev: string | null;
  };
}

export const getAttendanceAdjustmentRequests = async (
  pagination?: PaginationState,
  filters?: { search?: string; date?: string; status?: string },
): Promise<AttendanceAdjustmentRequestListResponse> => {
  const searchParams: Record<string, string> = {};

  if (pagination) {
    searchParams.page = String(pagination.pageIndex + 1);
    searchParams.per_page = String(pagination.pageSize);
  }
  if (filters?.search) searchParams.search = filters.search;
  if (filters?.date) searchParams.date = filters.date;
  if (filters?.status) searchParams.status = filters.status;

  const res = await api.get<AttendanceAdjustmentRequestListResponse>(
    'employee/attendance-adjustment-requests',
    { searchParams },
  );
  return res.json();
};

export const approveAttendanceAdjustmentRequest = async (id: number) => {
  const res = await api.post(`employee/attendance-adjustment-requests/${id}/approve`, { json: {} });
  return res.json();
};

export const rejectAttendanceAdjustmentRequest = async (id: number) => {
  const res = await api.post(`employee/attendance-adjustment-requests/${id}/reject`, { json: {} });
  return res.json();
};
