
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

export interface ScoreResponse {
    data: ScoreList[];
    message: string;
    pagination: Pagination;
    status: string;
}

export interface ScoreList {
    created_at: string;
    id: number;
    max_value: number;
    min_value: number;
    score: string;
    score_source?: "supervisor_final" | "self";
    tenant_id: number;
    updated_at: string;
}

export interface ScoreRequest {
    score: string;
    min_value: number;
    max_value: number;
    score_source?: "supervisor_final" | "self";
}