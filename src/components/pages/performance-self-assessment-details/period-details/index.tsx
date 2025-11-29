/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import StatusCard from "./sections/status-card";
import { useIsMobile } from "@/hooks/use-mobile";
import DataTable from "@/components/tables/data-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { LinearProgress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useSelfAssessmentPeriodDetails } from "./hook";
import AppSkeleton from "@/components/partials/app-skeleton";
import { IEmployeeAssessment } from "@/services/employees/self-assessment/types";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";

export const SelfAssessmentPeriodDetails = () => {
  const { assessmentDetails, isLoading, isError, handleViewEmployee } =
    useSelfAssessmentPeriodDetails();

  const columns: ColumnDef<IEmployeeAssessment>[] = [
    {
      accessorKey: "name",
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
            <span>Name</span>
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
    },
    {
      accessorKey: "submission_status",
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
            <span>Submission Status</span>
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
      cell: ({ row }) => row.original.submission_status,
    },
    {
      accessorKey: "score_avg",
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
            <span>Score Avg.</span>
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
      cell: ({ row }) => row.original.score,
    },
    {
      accessorKey: "supervisor",
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
            <span>Supervisor</span>
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
      cell: ({ row }) => row.original.supervisor,
    },
    {
      accessorKey: "form_name",
      header: "Assigned Form",
      cell: ({ row }) => row.original.form_name,
    },
    {
      accessorKey: "submitted_at",
      header: "Submitted On",
      cell: ({ row }) => row.original.submitted_at,
    },
    {
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => (
        <div className="flex flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            className="flex items-center gap-1"
            onClick={() => {
              handleViewEmployee(row.original.id);
            }}
          >
            <Eye className="w-4 h-4 text-primary" />
          </Button>
        </div>
      ),
    },
  ];

  const isMobile = useIsMobile();

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (isError || !assessmentDetails) {
    return <div>Assessment not found</div>;
  }

  const { assessment, summary, employees } = assessmentDetails;

  return (
    <div className="font-sans md:px-[125px] px-4 space-y-4">
      <h1 className="font-semibold text-4xl">
        Self Assessment {assessment.assessment_period} {assessment.year}
      </h1>
      <h2>Assessment Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">Start Date</span>
          <span className="text-base">{assessment.start_date}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">End Date</span>
          <span className="text-base">{assessment.end_date}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatusCard
          label="Completed"
          current={summary.completed}
          total={summary.total}
          statusColor="#18618B"
        />
        <StatusCard
          label="In Progress"
          current={summary.in_progress}
          total={summary.total}
          statusColor="#80C684"
        />
        <StatusCard
          label="Not Started"
          current={summary.not_started}
          total={summary.total}
          statusColor="#E57171"
        />
      </div>
      <div className="flex flex-col border border-grayscale-20 shadow-sm rounded-md p-4 gap-4">
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className="col-span-2">
            <h2 className="text-gray-900 font-semibold text-xl">
              Self Assessment Progress
            </h2>
            <span className="text-text-disabled text-sm">
              Completion Progress
            </span>
            <LinearProgress value={summary.progress} />
          </div>
          <Input className="" placeholder="Search Employee" />
        </div>
        <DataTable columns={columns} data={employees} customSize={!isMobile} />
      </div>
    </div>
  );
};
