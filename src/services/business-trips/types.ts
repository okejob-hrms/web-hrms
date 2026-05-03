import { ApiPagination } from "@/lib/types";

export interface IBusinessTripUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  employee_id: number | null;
  employee_code: string | null;
  photo_profile: string | null;
  photo_profile_url: string | null;
}

export interface IBusinessTripResponse {
  id: number;
  user_id: number;
  tenant_id: number;
  start_date: string;
  end_date: string;
  destination: string;
  reason: string;
  status: number;
  status_str: string;
  approved_at: string | null;
  approved_by_id: number | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  user: IBusinessTripUser;
  approver: IBusinessTripUser | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IBusinessTripListResponse {
  status: string;
  message: string;
  data: IBusinessTripResponse[];
  pagination: ApiPagination;
}

export interface IBusinessTripDetailResponse {
  status: string;
  message: string;
  data: IBusinessTripResponse;
}

export interface IBusinessTripActionRequest {
  notes?: string | null;
}
