import DataTable from "@/components/tables/data-table";
import { Badge } from "@/components/ui/badge";
import { getStatusGeneratingPayroll, getStatusPayroll } from "@/lib/helpers";
import { formatCurrency } from "@/lib/utils";
import { getPayrollEmployee } from "@/services/employees/payrolls";
import { IEmployeePayroll } from "@/services/employees/payrolls/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Clock, Eye } from "lucide-react";
import { PayrollDetailModal } from "./payroll-detail-modal";
import * as React from "react";

interface Props {
  userId: number;
}

export const PayrollDetail = React.memo(function PayrollDetail({
  userId,
}: Props) {
  const [selectedPayrollId, setSelectedPayrollId] = React.useState<
    number | null
  >(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const columns: ColumnDef<IEmployeePayroll>[] = [
    {
      accessorKey: "period_label",
      header: "Period",
      cell: ({ row }) => row.original.period_label ?? "-",
    },
    {
      accessorKey: "total",
      header: "Total Payslip",
      cell: ({ row }) => (
        <span className="text-gray-800">
          {formatCurrency(Number(row.original.total_payslips))}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total Pay",
      size: 200,
      cell: ({ row }) => (
        <span className="text-gray-400">
          Rp{" "}
          <span className="text-gray-800">
            {formatCurrency(Number(row.original.total_gross_pay))}
          </span>
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Payslip Status",
      cell: ({ row }) => {
        const status = row.original.status_label;
        const { variant, className, label } = getStatusPayroll(status);
        if (!row.original.status_label) return "-";

        return (
          <Badge variant={variant} className={className}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "generation_status_label",
      header: "Generation Status",
      size: 160,
      cell: ({ row }) => {
        const status = row.original.generation_status_label;
        const { variant, className, label } =
          getStatusGeneratingPayroll(status);
        if (!row.original.generation_status_label) return "-";

        return (
          <Badge variant={variant} className={className}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      size: 200,
      cell: ({ row }) =>
        dayjs(row.original.updated_at).format("MMMM D, YYYY") || "-",
    },
    {
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => (
        <button
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => {
            setSelectedPayrollId(row.original.id);
            setDetailOpen(true);
          }}
        >
          <Eye className="w-4 h-4 text-gray-500" />
        </button>
      ),
    },
  ];
  const { data: payrollData, isLoading } = useQuery({
    queryKey: ["employee-payroll", userId],
    queryFn: () => getPayrollEmployee(userId),
    enabled: !!userId,
  });

  const payrolls = payrollData?.data ?? [];

  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <h1 className="font-semibold text-lg">Payroll</h1>
      <DataTable columns={columns} data={payrolls} maxBodyHeight={500} />

      <PayrollDetailModal
        userId={userId}
        payrollId={selectedPayrollId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
});
