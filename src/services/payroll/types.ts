export interface PayrollGroupRequest {
    auto_send_payslip?: boolean;
    notes?: string;
    period_month: number;
    period_year: number;
    send_payslip_at?: string;
}