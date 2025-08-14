"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useDepartmentManagement } from "@/components/pages/department-management/hooks/useDepartmentManagement";
import DepartmentModal from "./sections/edit-modal";
import { DataTable } from "@/components/tables/data-table";
import { IDepartment } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/tables/row-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { formatDateTime } from "@/lib/helpers";
import DeleteDepartmentDialog from "./sections/delete-modal";

export default function DepartmentManagementList() {
  const {
    setDepartmentName,
    setDescription,
    open,
    setOpen,
    departments,
    editIndex,
    handleSave,
    handleClose,
    deleteDialogOpen,
    setDeleteDialogOpen,
    setDeleteIndex,
    handleDelete,
    handleEdit,
  } = useDepartmentManagement();

  const columns: ColumnDef<IDepartment>[] = [
    {
      accessorKey: "departmentName",
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
          <div className="flex flex-row gap-2">
            <span>Last Update</span>
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
          <RowActions
            onEdit={() => {
              handleEdit(item.id);
            }}
            onDelete={() => {
              setDeleteIndex(item.id);
              setDeleteDialogOpen(true);
            }}
          />
        );
      },
    },
  ];

  const isMobile = useIsMobile();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      {/* Outer container: center content, limit max width, add horizontal padding */}
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col justify-between gap-6">
          <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
              {/* Header Left */}
              <div className="flex gap-2 items-center flex-wrap">
                <h2 className="font-semibold text-xl">Department List</h2>
                <Badge className="bg-primary-background text-primary rounded-full">
                  {departments.length} Departments
                </Badge>
              </div>
              {/* Button */}
              <Button
                onClick={() => {
                  setOpen(true);
                  setDepartmentName("");
                  setDescription("");
                }}
                className="whitespace-nowrap"
              >
                + New Department
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={departments}
              customSize={!isMobile}
            />
          </div>
        </div>
      </div>
      {/* Modals */}
      <DeleteDepartmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
      />
      <DepartmentModal
        open={open}
        onOpenChange={setOpen}
        editIndex={editIndex}
        handleSave={handleSave}
        handleClose={handleClose}
      />
    </div>
  );
}
