export interface OvertimeData {
    data: OvertimeDataList;
    summary: OvertimeDataSummary;
}

export interface OvertimeDataList {
    current_page: number;
    data: OvertimeListItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Link[];
    next_page_url: null;
    path: string;
    per_page: number;
    prev_page_url: null;
    to: number;
    current_page_url: string;
    total: number;
}

export interface OvertimeListItem {
    approved_by?: null;
    approver?: null;
    created_at?: string;
    creator?: null;
    duration?: number;
    employee?: Employee;
    end_time?: string;
    id?: number;
    notes?: string;
    overtime_date?: string;
    request_date?: string;
    start_time?: string;
    status: number;
    updated_at?: string;
    user_id?: number;
}

export interface Employee {
    created_at: string;
    deleted_at: null;
    email: string;
    email_verified_at: null;
    first_login_at: string;
    id: number;
    is_first_login: boolean;
    name: string;
    tenant_id: number;
    updated_at: string;
    avatar_url: string;
}

export interface Link {
    active: boolean;
    label: string;
    page: number | null;
    url: null | string;
}

export interface OvertimeDataSummary {
    approved: number;
    new_requests: NewRequests;
    pending: number;
    rejected: number;
}

export interface NewRequests {
    difference: number;
    today: number;
    yesterday: number;
}

export interface RequestOvertimeStatus {
    user_id: number;
    overtime_date: string;
    request_date: string;
    start_time: string;
    end_time: string;
    notes: string;
}