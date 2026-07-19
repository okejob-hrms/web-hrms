"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Can } from "@/components/auth/can";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, ChevronsUpDown, Eye } from "lucide-react";
import { getStatusSelfAssessment } from "@/lib/helpers";
import { useSelfAssessment } from "./hook";
import { ISelfAssessmentResponse } from "@/services/employees/self-assessment/types";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";

export default function SelfAssessmentList() {
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");
  const {
    assessments,
    handleNew,
    handleView,
    loading,
    pagination,
    setPagination,
  } = useSelfAssessment();
  const columns: ColumnDef<ISelfAssessmentResponse>[] = [
    {
      accessorKey: "assessment_period",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>{t("assessmentPeriod")}</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
      cell: ({ row }) => (
        <span>
          {row.original.assessment_period} {row.original.year}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>{tCommon("status")}</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
      cell: ({ row }) => {
        const { key, variant, className } = getStatusSelfAssessment(row.original.status);
        return (
          <StatusBadge statusKey={key} variant={variant} className={className} />
        );
      },
    },
    {
      accessorKey: "start_date",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>{t("startDate")}</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
      cell: ({ row }) => dayjs(row.original.start_date).format("MMMM DD, YYYY"),
    },
    {
      accessorKey: "end_date",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>{t("endDate")}</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
      cell: ({ row }) => dayjs(row.original.end_date).format("MMMM DD, YYYY"),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>{t("createdAt")}</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
      cell: ({ row }) => dayjs(row.original.created_at).format("MMMM DD, YYYY"),
    },
    {
      accessorKey: "submitted",
      header: t("submitted"),
      cell: ({ row }) => {
        return (
          <div className="flex">
            <span className="font-semibold text-black">
              {row.original.submitted}
            </span>
            <span className="text-text-disabled font-normal">
              /{row.original.total_employees} {tCommon("employees")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "progress",
      header: t("progress"),
      cell: ({ row }) => {
        return <span>{row.original.progress}%</span>;
      },
    },
    {
      accessorKey: "created_by",
      header: t("createdBy"),
      cell: ({ row }) => {
        return <span>{row.original.creator.name}</span>;
      },
    },
    {
      maxSize: 70,
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleView(row.original.id)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  const isMobile = useIsMobile();

  if (loading) {
    return <Skeleton />;
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="font-semibold text-xl">{t("selfAssessment")}</h2>
            </div>
            <Can permission="performance_self_assessment.assessment_cycle.create">
              <Button onClick={() => handleNew()} className="whitespace-nowrap">
                {t("newAssessment")}
              </Button>
            </Can>
          </div>
          <DataTable
            columns={columns}
            data={assessments?.data || []}
            customSize={!isMobile}
            pagination={assessments}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        </div>
      </div>
    </div>
  );
}
