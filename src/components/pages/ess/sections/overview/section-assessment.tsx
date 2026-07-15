"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { IEmployeeSelfAssessmentResponse } from "@/services/employees/self-assessment/types";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { getEmployeeSelfAssessments } from "@/services/employees/self-assessment";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocale, toIntlLocale } from "@/lib/i18n/locale";
import { StatusBadge } from "@/components/shared/status-badge";
import { resolveStatusKey } from "@/lib/i18n/status";

export const SectionAssessment = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());

  const formatDate = React.useCallback(
    (date: string) =>
      new Intl.DateTimeFormat(toIntlLocale(locale), {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date)),
    [locale],
  );

  const handleViewAssessment = React.useCallback(
    (row: IEmployeeSelfAssessmentResponse) => {
      if (row.id != null && row.form_id != null) {
        queryClient.invalidateQueries({
          queryKey: ["form-detail", row.form_id],
        });
        router.push(`/ess/assessment/${row.id}?formId=${row.form_id}`);
        return;
      }
      if (row.self_assessment_id) {
        router.push(`/ess/assessment/p-${row.self_assessment_id}`);
      }
    },
    [queryClient, router],
  );

  const columns: ColumnDef<IEmployeeSelfAssessmentResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "period",
        header: t("period"),
        cell: ({ row }) => row.original.period ?? "-",
      },
      {
        accessorKey: "span-1",
        header: "",
      },
      {
        accessorKey: "span-2",
        header: "",
      },
      {
        accessorKey: "span-3",
        header: "",
      },
      {
        accessorKey: "span-4",
        header: "",
      },
      {
        accessorKey: "end_date",
        header: t("endDate"),
        cell: ({ row }) =>
          row.original.due_date ? formatDate(row.original.due_date) : "-",
      },
      {
        accessorKey: "status",
        header: tCommon("status"),
        cell: ({ row }) => {
          const statusKey = resolveStatusKey(row.original.status);
          return (
            <StatusBadge
              statusKey={statusKey}
              variant="secondary"
              className=""
            />
          );
        },
      },
      {
        accessorKey: "menu",
        header: "",
        cell: ({ row }) => (
          <div
            onClick={() => handleViewAssessment(row.original)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex items-center justify-center w-fit"
          >
            <Eye className="w-4 h-4 text-gray-500" />
          </div>
        ),
      },
    ],
    [formatDate, handleViewAssessment, t, tCommon],
  );

  const { data: selfAssessments, isLoading } = useQuery({
    queryKey: ["employee-self-assessment"],
    queryFn: () => getEmployeeSelfAssessments(),
  });

  return (
    <div className="font-sans min-h-screen flex flex-col w-full gap-2 px-8 py-6">
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
        <h2 className="font-semibold text-xl">{t("selfAssessment")}</h2>
        <DataTable
          columns={columns}
          data={selfAssessments?.data || []}
          loading={isLoading}
        />
      </div>
    </div>
  );
};
