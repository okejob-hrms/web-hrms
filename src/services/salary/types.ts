export interface ResponseAllowance {
    data: AllowanceItem[];
    message: string;
    status: string;
}

export interface AllowanceItem {
    id: number;
    name: string;
    description: string;
    effective_date: string;
    expire_date: string;
    job_levels: AllowanceItemJobList[];
    created_at: string;
    updated_at: string;
}

export interface RequestAllowance {
    name: string;
    description: string;
    effective_date: string;
    expire_date: string;
    allowance_items: AllowanceItemReq[];
}

export interface AllowanceItemJobList {
    id: number;
    name: string;
    amount: string;
}

export interface AllowanceItemReq {
    job_level_id: number;
    amount: number;
}

export interface ResponseBaseSalary {
    data: BaseSalaryItem[];
    message: string;
    status: string;
}

export interface BaseSalaryItem { 
    id: number;
    job_level_id: number;
    job_position_id: number;
    amount: number;
    effective_date: string;
    end_date: string;
    updated_at?: string;
}

export interface RequestBaseSalary { 
    job_level_id: number;
    job_position_id: number;
    amount: number;
    effective_date: string;
    end_date: string;
}
