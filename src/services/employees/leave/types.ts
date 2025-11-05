export interface IUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  is_first_login: boolean;
  first_login_at: string | null;
  deleted_at: string | null;
  avatar_url?: string | null;
}

export interface ILeaveType {
  id: number;
  name: string;
  description: string;
  gender: string;
  quota_configuration: string;
  created_at: string;
  updated_at: string;
}

export interface ILeaveApprover {
  id: number;
  approver_id: number;
  user_id: number;
  approver_type: string;
  status: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user: IUser;
}

export interface ILeaveResponse {
  id: number;
  user_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: number;
  attachment: string | null;
  created_at: string;
  updated_at: string;
  user: IUser;
  leave_type: ILeaveType;
  approvers: ILeaveApprover[];
  notes: string;
  duration: number;
}

export interface IMutateLeaveRequest {
  user_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  attachment: string;
  approvers: {
    id: number;
    user_id: number;
    approver_type: string;
  }[];
}

export interface IMutateLeaveStatus {
  action: string;
  notes?: string;
  approver_id?: number;
}

export interface ILeaveSummary {
  pending: number;
  approved: number;
  rejected: number;
  new_requests: {
    today: number;
    yesterday: number;
    difference: number;
  };
  on_leave: {
    today: number;
    yesterday: number;
    difference: number;
  };
}

export interface NewRequests {
  difference: number;
  today: number;
  yesterday: number;
}

export interface IUserLeaveBalanceResponse {
  available_time_off: number;
  time_off_used: number;
}
