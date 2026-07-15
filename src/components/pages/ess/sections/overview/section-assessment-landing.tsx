"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Eye, Loader2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getEmployeeSelfAssessments } from "@/services/employees/self-assessment";
import {
  IEmployeeSelfAssessmentResponse,
  ITeamMember,
} from "@/services/employees/self-assessment/types";
import { resolveLocale, toIntlLocale } from "@/lib/i18n/locale";
import { resolveStatusKey } from "@/lib/i18n/status";

interface SectionAssessmentLandingProps {
  assessmentId: string;
}

export const SectionAssessmentLanding: React.FC<
  SectionAssessmentLandingProps
> = ({ assessmentId }) => {
  const router = useRouter();
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());

  const { data: selfAssessments, isLoading } = useQuery({
    queryKey: ["employee-self-assessment"],
    queryFn: () => getEmployeeSelfAssessments(),
  });

  const periodRow = React.useMemo(() => {
    const rows = selfAssessments?.data ?? [];
    const numericId = Number(assessmentId);

    if (assessmentId.startsWith("p-")) {
      const periodId = Number(assessmentId.slice(2));
      return rows.find((row) => row.self_assessment_id === periodId);
    }

    return rows.find(
      (row) =>
        row.id === numericId || row.self_assessment_id === numericId,
    );
  }, [selfAssessments?.data, assessmentId]);

  const formatDate = React.useCallback(
    (date: string | null) => {
      if (!date) return "-";
      return new Intl.DateTimeFormat(toIntlLocale(locale), {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(date));
    },
    [locale],
  );

  const teamColumns: ColumnDef<ITeamMember>[] = React.useMemo(
    () => [
      {
        accessorKey: "user_name",
        header: t("teamMember"),
        cell: ({ row }) => row.original.user_name ?? "-",
      },
      {
        accessorKey: "job_position_name",
        header: t("position"),
        cell: ({ row }) => row.original.job_position_name ?? "-",
      },
      {
        accessorKey: "status_label",
        header: tCommon("status"),
        cell: ({ row }) => {
          const statusKey = resolveStatusKey(row.original.status_label);
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
        accessorKey: "submitted_at",
        header: t("submittedOn"),
        cell: ({ row }) => formatDate(row.original.submitted_at),
      },
      {
        accessorKey: "menu",
        header: "",
        cell: ({ row }) => {
          const member = row.original;
          const canOpen =
            member.status_label === "Completed" ||
            member.status_label === "Validated";
          if (!canOpen) return null;
          return (
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/ess/assessment/${member.id}/validate?formId=${member.form_id}`,
                )
              }
              className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex items-center justify-center w-fit"
            >
              <Eye className="w-4 h-4 text-gray-500" />
            </button>
          );
        },
      },
    ],
    [formatDate, router, t, tCommon],
  );

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!periodRow) {
    return (
      <div className="px-8 py-6 text-center text-gray-500">
        {t("assessmentNotFound")}
      </div>
    );
  }

  const hasOwnAssessment =
    periodRow.id != null &&
    periodRow.form_id != null &&
    periodRow.status !== "Manager View";

  return (
    <div className="font-sans min-h-screen flex flex-col w-full gap-6 px-8 py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("selfAssessment")} — {periodRow.period}
        </h1>
        <p className="text-gray-500">{periodRow.due_date}</p>
      </div>

      {hasOwnAssessment && (
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-xl">{t("mySelfAssessment")}</h2>
              <p className="text-sm text-gray-500">
                {tCommon("status")}: {periodRow.status}
              </p>
            </div>
            <Button
              type="button"
              onClick={() =>
                router.push(
                  `/ess/assessment/${periodRow.id}/form?formId=${periodRow.form_id}`,
                )
              }
            >
              {periodRow.status === "Completed" ||
              periodRow.status === "Validated"
                ? t("viewAssessment")
                : t("fillAssessment")}
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
        <h2 className="font-semibold text-xl">{t("teamAssessments")}</h2>
        {(periodRow.team_member?.length ?? 0) === 0 ? (
          <p className="text-sm text-gray-500">{t("noTeamMembers")}</p>
        ) : (
          <DataTable
            columns={teamColumns}
            data={periodRow.team_member}
            loading={false}
          />
        )}
      </div>
    </div>
  );
};
