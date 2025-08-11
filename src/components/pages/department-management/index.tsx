"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { useRouter } from "next/navigation";
import { DepartmentListTable } from "./components/table";
import { DepartmentListPagination } from "./components/pagination";
import { useDepartmentManagement } from "@/components/pages/department-management/hooks/useDepartmentManagement";
import DepartmentModal from "./components/DepartmentModal";
import DeleteDepartmentDialog from "./components/deleteDepartmentDialog";

export default function DepartmentManagementList() {
  const router = useRouter();
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
  console.log("OPEN", open);
  return (
    <div className="font-sans min-h-screen">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4">
          <div className="flex justify-between w-full items-center pt-6 pl-6 pr-6">
            <div className="flex gap-2 items-center">
              <h2 className="font-semibold text-xl">Department List</h2>
              <Badge className="bg-primary-background text-primary rounded-full">
                {departments.length} Departments
              </Badge>
            </div>
            <Button
              onClick={() => {
                setOpen(true);
                setDepartmentName("");
                setDescription("");
              }}
            >
              + New Department
            </Button>
          </div>
          <DepartmentListTable
            data={departments}
            onEdit={(item) => {
              handleEdit(item.departmentId);
            }}
            onDelete={(item) => {
              // store the selected item if needed
              setDeleteIndex(item.departmentId);
              setDeleteDialogOpen(true);
            }}
          />

          <Separator />
          <DepartmentListPagination />
        </div>
      </div>
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
