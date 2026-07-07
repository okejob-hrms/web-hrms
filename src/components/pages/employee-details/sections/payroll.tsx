import DataTable from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { getStatusGeneratingPayroll, getStatusPayroll } from "@/lib/helpers";
import { formatCurrency } from "@/lib/utils";
import { getPayrollEmployee } from "@/services/employees/payrolls";
import { IEmployeePayroll } from "@/services/employees/payrolls/types";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Eye } from "lucide-react";
import { PayrollDetailModal } from "./payroll-detail-modal";
import * as React from "react";
import { useTranslations } from "next-intl";

interface Props {
  userId: number;
}

export const PayrollDetail = React.memo(function PayrollDetail({
  userId,
}: Props) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [selectedPayrollId, setSelectedPayrollId] = React.useState<
    number | null
  >(null);
  const [detailOpen, setDetailOpen] = React.useState(false);

  const columns: ColumnDef<IEmployeePayroll>[] = React.useMemo(
    () => [
      {
        accessorKey: "period_label",
        header: t("employeePayrollPeriod"),
        cell: ({ row }) => row.original.period_label ?? "-",
      },
      {
        id: "total_payslips",
        accessorKey: "total",
        header: t("totalPayslip"),
        cell: ({ row }) => (
          <span className="text-gray-800">
            {formatCurrency(Number(row.original.total_payslips))}
          </span>
        ),
      },
      {
        id: "total_gross_pay",
        accessorKey: "total",
        header: t("totalPay"),
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
        header: t("payslipStatus"),
        cell: ({ row }) => {
          const status = row.original.status_label;
          const { variant, className, key } = getStatusPayroll(status);
          if (!row.original.status_label) return "-";

          return (
            <StatusBadge
              statusKey={key}
              variant={variant}
              className={className}
            />
          );
        },
      },
      {
        accessorKey: "generation_status_label",
        header: t("generationStatus"),
        size: 160,
        cell: ({ row }) => {
          const status = row.original.generation_status_label;
          const { variant, className, key } =
            getStatusGeneratingPayroll(status);
          if (!row.original.generation_status_label) return "-";

          return (
            <StatusBadge
              statusKey={key}
              variant={variant}
              className={className}
            />
          );
        },
      },
      {
        accessorKey: "updated_at",
        header: tCommon("lastUpdated"),
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
    ],
    [t, tCommon],
  );

  const { data: payrollData } = useQuery({
    queryKey: ["employee-payroll", userId],
    queryFn: () => getPayrollEmployee(userId),
    enabled: !!userId,
  });

  const payrolls = payrollData?.data ?? [];

  return (
    <div className="flex flex-col w-full gap-2 p-2">
      <h1 className="font-semibold text-lg">{t("payroll")}</h1>
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
