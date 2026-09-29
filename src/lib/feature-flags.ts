/**
 * @deprecated "Send Payslip Automatically" is hidden for the current client. Kept so it can be
 * resurfaced: set NEXT_PUBLIC_PAYSLIP_AUTO_SEND=true here and PAYROLL_AUTO_SEND_PAYSLIP_ENABLED=true
 * in core-hrms, otherwise the API discards the fields.
 */
export const PAYSLIP_AUTO_SEND_ENABLED =
  process.env.NEXT_PUBLIC_PAYSLIP_AUTO_SEND === 'true';
