"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useDepartmentManagement } from "@/components/pages/department-management/hooks/useDepartmentManagement";
import DeleteDepartmentDialog from "./sections/delete-modal";
import DepartmentModal from "./sections/edit-modal";
import { DataTable } from "@/components/tables/data-table";
import { IDepartment } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/tables/row-actions";

export default function DepartmentManagementList() {
  const {
    departmentName,
    setDepartmentName,
    description,
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
      size: 400, // px
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 480, // make this wide so long description wraps inside it
    },
    {
      accessorKey: "lastUpdate",
      header: "Last Update",
      size: 160,
      cell: ({ row }) => {
        const lastUpdateDate = row.original.lastUpdateDate;
        const lastUpdateHour = row.original.lastUpdateHour;
        return (
          <div>
            <span>{lastUpdateDate}</span>
            <br />
            <span>{lastUpdateHour}</span>
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
              handleEdit(item.departmentId);
            }}
            onDelete={() => {
              setDeleteIndex(item.departmentId);
              setDeleteDialogOpen(true);
            }}
          />
        );
      },
    },
  ];

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
            <DataTable columns={columns} data={departments} customSize />
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
        departmentName={departmentName}
        setDepartmentName={setDepartmentName}
        description={description}
        setDescription={setDescription}
        editIndex={editIndex}
        handleSave={handleSave}
        handleClose={handleClose}
      />
    </div>
  );
}
