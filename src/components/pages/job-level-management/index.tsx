"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/tables/row-actions";
import { useIsMobile } from "@/hooks/use-mobile";
// import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { formatDateTime } from "@/lib/helpers";
import { Skeleton } from "@/components/ui/skeleton";
import { JobLevel } from "@/services/job-levels/types";
import { useJobLevels } from "./hooks/useJobLevel";
import DeleteJobLevelDialog from "./sections/delete-modal";
import JobLevelModal from "./sections/edit-modal";

export default function JobLevelList() {
  const {
    job_levels,
    isLoading,
    isEditModalOpen,
    setEditModalOpen,
    isDeleteDialogOpen,
    setDeleteDialogOpen,
    selectedJobLevel,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleSave,
    handleDeleteConfirm,
    handleClose,
    pagination,
    setPagination,
  } = useJobLevels();

  const columns: ColumnDef<JobLevel>[] = [
    {
      accessorKey: "name",
      header: "Job Level",
      size: 300,
    },
    {
      accessorKey: "level",
      header: "Level",
      size: 300,
    },
    {
      accessorKey: "lastUpdate",
      header: ({}) => {
        // const isSorted = column.getIsSorted();
        // const SortIcon = () =>
        //   isSorted === "asc" ? (
        //     <ArrowUp className="w-3 h-3" />
        //   ) : isSorted === "desc" ? (
        //     <ArrowDown className="w-3 h-3" />
        //   ) : (
        //     <ChevronsUpDown className="w-3 h-3 opacity-50" />
        //   );

        return (
          <div className="flex flex-row gap-2">
            <span>Last Update</span>
            {/* <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button> */}
          </div>
        );
      },
      size: 160,
      cell: ({ row }) => {
        const { date, hour } = formatDateTime(row.original.updated_at);

        return (
          <div>
            <span>{date}</span>
            <br />
            <span>{hour}</span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      size: 80,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                handleEdit(item);
              }}
              onDelete={() => {
                handleDeleteClick(item);
              }}
            />
          </div>
        );
      },
    },
  ];

  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col justify-between gap-6">
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex gap-2 items-center flex-wrap">
            <h2 className="font-semibold text-xl">Job Levels</h2>
          </div>
          <Button onClick={handleCreate} className="whitespace-nowrap">
            + New Job Level
          </Button>
        </div>
        {isLoading ? (
          <div className="flex flex-col gap-4 items-center w-full">
            <Skeleton className="h-12 w-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-30 w-full" />
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={job_levels?.data}
            customSize={!isMobile}
            pagination={job_levels}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        )}
      </div>
      {/* Modals */}
      <DeleteJobLevelDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteConfirm}
        isLoading={isLoading}
      />
      <JobLevelModal
        open={isEditModalOpen}
        onOpenChange={setEditModalOpen}
        initialData={selectedJobLevel}
        handleSave={handleSave}
        handleClose={handleClose}
        isLoading={isLoading}
      />
    </div>
  );
}
