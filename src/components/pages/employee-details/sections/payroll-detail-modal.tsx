import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getPayrollEmployeeDetails } from "@/services/employees/payrolls";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import dayjs from "dayjs";
import { Badge } from "@/components/ui/badge";
import { getStatusGeneratingPayroll, getStatusPayroll } from "@/lib/helpers";

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
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["payroll-detail", userId, payrollId],
    queryFn: () => getPayrollEmployeeDetails(userId, payrollId!),
    enabled: !!payrollId && open,
  });

  const payroll = payrollData?.data;

  const renderStatus = (statusLabel: string) => {
    const { variant, className, label } = getStatusPayroll(statusLabel);
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    );
  };

  const renderGenerationStatus = (statusLabel: string) => {
    const { variant, className, label } =
      getStatusGeneratingPayroll(statusLabel);
    return (
      <Badge variant={variant} className={className}>
        {label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Payroll Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-4">Loading...</div>
        ) : payroll ? (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2 space-y-1">
              <div className="text-gray-500">Employee</div>
              <div className="font-medium text-lg">{payroll.employee.name}</div>
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
                  ? dayjs(payroll.sent_at).format("DD MMM YYYY HH:mm")
                  : "-"}
              </div>
            </div>

            <div className="col-span-2 border-t pt-4 mt-2">
              <div className="text-xs text-gray-400">
                Payrun Created By: {payroll.payrun.created_by?.name}
              </div>
              <div className="text-xs text-gray-400">
                Created At:{" "}
                {dayjs(payroll.created_at).format("DD MMM YYYY HH:mm")}
              </div>
              <div className="text-xs text-gray-400">
                Updated At:{" "}
                {dayjs(payroll.updated_at).format("DD MMM YYYY HH:mm")}
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
