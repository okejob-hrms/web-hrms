"use client";

import DepartmentModal from "./DepartmentModal";
import { useDepartmentManagement } from "../hooks/useDepartmentManagement";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import DeleteDepartmentDialog from "./deleteDepartmentDialog";

export default function DepartmentManagement() {
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
    handleEdit,
    handleClose,
    deleteIndex,
    setDeleteIndex,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleDelete,
  } = useDepartmentManagement();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Button
        className="mb-8"
        onClick={() => {
          setOpen(true);
          setDepartmentName("");
          setDescription("");
        }}
      >
        Manage Departments
      </Button>
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
      {/* Department List */}
      <div className="w-full max-w-md mt-8">
        <h2 className="text-lg font-semibold mb-4">Department List</h2>
        {departments.length === 0 ? (
          <p className="text-gray-500">No departments created yet.</p>
        ) : (
          <ul className="space-y-2">
            {departments.map((dept, idx) => (
              <li key={idx} className="border rounded p-3 flex flex-col gap-2">
                <div className="font-medium flex justify-between items-center">
                  <span>{dept.departmentName}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="px-3 py-1 bg-[#18618B] hover:bg-[#14506e] text-white font-medium rounded"
                      onClick={() => handleEdit(idx)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="px-3 py-1 bg-transparent text-red-500 hover:bg-transparent font-medium rounded shadow-none border-none"
                      onClick={() => {
                        setDeleteIndex(idx);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                {dept.description && (
                  <div className="text-sm text-gray-600">
                    {dept.description}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <DeleteDepartmentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
      />
    </div>
  );
}
