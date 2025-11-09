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


export interface ResponseDeductionSalary {
    data: DeductionSalaryItem[];
    message: string;
    status: string;
}

export interface DeductionSalaryItem { 
    id?: number;
    name: string;
    status?: number;
    tenant_id?: number;
    calculation_basis: string;
    contribution_type: string;
    created_at?: string;
    deduction_type: string;
    deleted_at?: null;
    description: string;
    effective_date: string;
    effective_to: string;
    employee_contribution: string;
    employer_contribution: string;
    updated_at?: string;
    tiers?: DeductionSalaryTier[];
}

export interface RequestDeductionSalary { 
    name: string;
    status: number;
    deduction_type: string;
    effective_date: string;
    effective_to: string;
    description: string;
    employer_contribution: string;
    employee_contribution: string;
    calculation_basis?: string;
    contribution_type?: string;
    tiers?: DeductionSalaryTier[];
}

export interface DeductionSalaryTier { 
    created_at: string;
    id: number;
    max_income: string;
    min_income: string;
    salary_deduction_id: number;
    tax_rate: string;
    updated_at: string;
}

export interface DeductionSalaryItemTypeList {
    status: string;
    data: DeductionSalaryItemType[];
}

export interface DeductionSalaryItemType {
    id: number;
    name: string;
}