export interface ResponsePayrollList {
    data: ResponsePayrollItem[];
    message: string;
    pagination: ResponsePayrollPagination;
    status: string;
}

export interface ResponsePayrollItem {
    auto_send_payslip: boolean;
    can_be_cancelled: boolean;
    can_be_locked: boolean;
    can_be_sent: boolean;
    created_at: string;
    created_by: ResponsePayrollAuthor;
    generation_status: number;
    generation_status_label: string;
    id: number;
    is_generating: boolean;
    is_generation_completed: boolean;
    locked_at: null;
    notes: string;
    period_label: string;
    period_month: number;
    period_year: number;
    send_payslip_at: string;
    sent_at: null;
    status: number;
    status_label: string;
    tenant_id: number;
    updated_at: string;
}

export interface ResponsePayrollAuthor {
    email: string;
    id: number;
    name: string;
}

export interface ResponsePayrollPagination {
    current_page: number;
    first: string;
    from: number;
    last: string;
    last_page: number;
    next: string;
    per_page: number;
    prev: string;
    to: number;
    total: number;
}

export interface RequestPayrollGroup {
    notes: string;
    period_month: number;
    period_year: number;
    auto_send_payslip?: boolean;
    send_payslip_at?: string;
}