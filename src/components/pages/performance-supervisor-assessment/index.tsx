"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, ChevronsUpDown, Eye } from "lucide-react";
import { useSupervisorAssessment } from "./hook";
import SupervisorAssessmentFormModal from "./sections/add-modal";
import { ISupervisorAssessmentResponse } from "@/services/performances/supervisor-assessment/types";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";

export default function SupervisorAssessmentList() {
  const {
    setOpenFormModal,
    openFormModal,
    handleNew,
    handleView,
    handleFormSubmit,
    openDelete,
    setOpenDelete,
    handleDelete,
    setSelectedId,
    data,
    isLoading,
    isFetching,
    employeesOptions,
    positionOptions,
    isPositionsLoading,
    positionsError,
    jobLevelOptions,
    isJobLevelsLoading,
    jobLevelsError,
    isLoadingEmployees,
    searchAssesssor,
    setSearchAssesssor,
    formOptions,
    isLoadingForms,
    formsError,
    isSubmitting,
  } = useSupervisorAssessment();

  const columns: ColumnDef<ISupervisorAssessmentResponse>[] = [
    {
      accessorKey: "user.name",
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
            <span>Employee Name</span>
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
      accessorKey: "current_position.name",
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
            <span>Previous Position</span>
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
      accessorKey: "target_position.name",
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
            <span>Target Position</span>
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
      accessorKey: "final_score",
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
            <span>Final Score</span>
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
      accessorKey: "schedule",
      header: "Interview Date",
      cell: ({ row }) => (
        <span>{dayjs(row.original.schedule?.date).format("MMMM D, YYYY")}</span>
      ),
    },
    {
      accessorKey: "status_label",
      header: "Assessment Result",
    },
    {
      accessorKey: "menu",
      size: 70,
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          onClick={() => handleView(row.original.id)}
          className="whitespace-nowrap"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const isMobile = useIsMobile();

  if (isLoading || isFetching) {
    return <Skeleton />;
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="font-semibold text-xl">Supervisor Assessment</h2>
            </div>
            <Button onClick={() => handleNew()} className="whitespace-nowrap">
              + New Assessment
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data?.data}
            customSize={!isMobile}
          />
        </div>

        <SupervisorAssessmentFormModal
          open={openFormModal}
          onOpenChange={setOpenFormModal}
          onSubmit={handleFormSubmit}
          employeesOptions={employeesOptions}
          positionOptions={positionOptions}
          isPositionsLoading={isPositionsLoading}
          positionsError={positionsError}
          jobLevelOptions={jobLevelOptions}
          isJobLevelsLoading={isJobLevelsLoading}
          jobLevelsError={jobLevelsError}
          isLoadingEmployees={isLoadingEmployees}
          searchAssesssor={searchAssesssor}
          setSearchAssesssor={setSearchAssesssor}
          formOptions={formOptions}
          isLoadingForms={isLoadingForms}
          formsError={formsError}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
