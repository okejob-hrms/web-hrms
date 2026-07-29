import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getPayrollEmployeeDetails } from '@/services/employees/payrolls';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import { StatusBadge } from '@/components/shared/status-badge';
import { getStatusPayroll } from '@/lib/helpers';
import { AttendancePenaltyEvidenceList } from '@/components/shared/attendance-penalty-evidence';
import { DeductionList } from '@/services/payroll/types';
import { useTranslations } from 'next-intl';

interface PayrollDetailModalProps {
  userId: number;
  payrollId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PayrollDetailModal({
  userId,
  payrollId,
  open,
  onOpenChange,
}: PayrollDetailModalProps) {
  const t = useTranslations('payroll');
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ['payroll-detail', userId, payrollId],
    queryFn: () => getPayrollEmployeeDetails(userId, payrollId!),
    enabled: !!payrollId && open,
  });

  const payroll = payrollData?.data;
  const deductions = (payroll?.deduction ?? []) as DeductionList[];
  const statutoryDeductions = deductions.filter(
    (d) => d.type !== 'ATTENDANCE_PENALTY',
  );

  const renderStatus = (statusLabel: string) => {
    const { variant, className, key } = getStatusPayroll(statusLabel);
    return (
      <StatusBadge statusKey={key} variant={variant} className={className} />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payroll Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-4">Loading...</div>
        ) : payroll ? (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <div className="text-gray-500">Employee</div>
                <div className="font-medium text-lg">
                  {payroll.employee.name}
                </div>
                <div className="text-xs text-gray-400">
                  {payroll.employee.job_title} - {payroll.employee.department}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Period</div>
                <div className="font-medium">{payroll.payrun.period_label}</div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Status</div>
                <div>{renderStatus(payroll.status_label)}</div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Total Allowances</div>
                <div className="font-medium">
                  Rp {formatCurrency(payroll.total_allowances)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">{t('penaltyDeduction')}</div>
                <div className="font-medium text-error">
                  Rp {formatCurrency(Number(payroll.total_penalties ?? 0))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Total Deductions</div>
                <div className="font-medium text-error">
                  Rp {formatCurrency(payroll.total_deductions)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Gross Pay</div>
                <div className="font-medium">
                  Rp {formatCurrency(Number(payroll.gross_pay))}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Net Pay</div>
                <div className="font-medium text-primary text-lg">
                  Rp {formatCurrency(payroll.net_pay)}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-gray-500">Sent At</div>
                <div className="font-medium">
                  {payroll.sent_at
                    ? dayjs(payroll.sent_at).format('DD MMM YYYY HH:mm')
                    : '-'}
                </div>
              </div>
            </div>

            {(payroll.allowance?.length ?? 0) > 0 && (
              <div className="space-y-2 border-t pt-4">
                <div className="font-medium">{t('allowance')}</div>
                {payroll.allowance.map((item) => (
                  <div
                    key={item.allowance_type_id}
                    className="flex justify-between gap-3"
                  >
                    <span className="text-muted-foreground">
                      {item.allowance_name}
                    </span>
                    <span>
                      Rp {formatCurrency(Number(item.allowance_value))}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {statutoryDeductions.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <div className="font-medium">Deductions</div>
                {statutoryDeductions.map((item, index) => (
                  <div
                    key={`${item.salary_deduction_id ?? item.name}-${index}`}
                    className="flex justify-between gap-3"
                  >
                    <span className="text-muted-foreground">{item.name}</span>
                    <span>Rp {formatCurrency(Number(item.amount))}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t pt-4">
              <div className="font-medium">{t('penaltyEvidenceTitle')}</div>
              <AttendancePenaltyEvidenceList items={deductions} />
            </div>

            <div className="border-t pt-4">
              <div className="text-xs text-gray-400">
                Payrun Created By: {payroll.payrun.created_by?.name}
              </div>
              <div className="text-xs text-gray-400">
                Created At:{' '}
                {dayjs(payroll.created_at).format('DD MMM YYYY HH:mm')}
              </div>
              <div className="text-xs text-gray-400">
                Updated At:{' '}
                {dayjs(payroll.updated_at).format('DD MMM YYYY HH:mm')}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground p-4">
            No details found.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
