"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useDepartmentManagement } from "@/components/pages/department-management/hooks/useDepartmentManagement";
import DepartmentModal from "./sections/edit-modal";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/tables/row-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { formatDateTime } from "@/lib/helpers";
import DeleteDepartmentDialog from "./sections/delete-modal";
import { DepartmentResponse } from "@/services/department/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function DepartmentManagementList() {
  const {
    departments,
    isLoading,
    isEditModalOpen,
    setEditModalOpen,
    isDeleteDialogOpen,
    setDeleteDialogOpen,
    selectedDepartment,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleSave,
    handleDeleteConfirm,
    handleClose,
    pagination,
    setPagination,
  } = useDepartmentManagement();

  const columns: ColumnDef<DepartmentResponse>[] = [
    {
      accessorKey: "name",
      header: "Department Name",
      size: 300,
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 480,
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
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col justify-between gap-6">
          <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex gap-2 items-center flex-wrap">
                <h2 className="font-semibold text-xl">Department List</h2>
                <Badge className="bg-primary-background text-primary rounded-full">
                  {pagination.pageIndex * pagination.pageSize +
                    (departments?.data?.data?.length ?? 0)}{" "}
                  Departments
                </Badge>
              </div>
              <Button onClick={handleCreate} className="whitespace-nowrap">
                + New Department
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
                data={departments?.data?.data}
                customSize={!isMobile}
                pagination={departments?.data}
                paginationState={pagination}
                setPaginationState={setPagination}
              />
            )}
          </div>
        </div>
      </div>
      {/* Modals */}
      <DeleteDepartmentDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteConfirm}
      />
      <DepartmentModal
        open={isEditModalOpen}
        onOpenChange={setEditModalOpen}
        initialData={selectedDepartment}
        handleSave={handleSave}
        handleClose={handleClose}
      />
    </div>
  );
}
