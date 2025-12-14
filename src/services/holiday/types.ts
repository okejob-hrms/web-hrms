
export interface Pagination {
    current_page: number;
    first: string;
    from: number;
    last: string;
    last_page: number;
    next: null;
    per_page: number;
    prev: null;
    to: number;
    total: number;
}

export interface HolidayResponse {
    data: HolidayList[];
    message: string;
    pagination: Pagination;
    status: string;
}

export interface HolidayList {
    category: number;
    created_at: string;
    date: string;
    events: string;
    id: number;
    tenant_id: number;
    type: number;
    updated_at: string;
}

export interface HolidayRequest {
    date: string;
    events: string;
    category: number;
    type: number;
}