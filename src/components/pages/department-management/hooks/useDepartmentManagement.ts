import { useState } from "react";
import { DepartmentFormValues } from "../types";
import { IDepartment } from "@/lib/types";

export function useDepartmentManagement() {
  const dummyDepartments: IDepartment[] = [];

  const [departmentName, setDepartmentName] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] =
    useState<IDepartment[]>(dummyDepartments);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleSave = (data: DepartmentFormValues) => {
    if (editIndex !== null) {
      setDepartments((departments) =>
        departments.map((dept, idx) =>
          idx === editIndex
            ? {
                name: data.name,
                description: data.description,
                id: idx,
                created_at: "2025-08-06T13:18:26.000000Z",
                updated_at: "2025-08-06T13:18:26.000000Z",
              }
            : dept,
        ),
      );
    } else {
      setDepartments([
        ...departments,
        {
          name: data.name,
          description: data.description,
          id: departments.length,
          created_at: "2025-08-06T13:18:26.000000Z",
          updated_at: "2025-08-06T13:18:26.000000Z",
        },
      ]);
    }
    setDepartmentName("");
    setDescription("");
    setEditIndex(null);
    setOpen(false);
  };

  const handleEdit = (idx: number) => {
    setDepartmentName(departments[idx].name);
    setDescription(departments[idx].description ?? "");
    setEditIndex(idx);
    setOpen(true);
  };

  const handleClose = () => {
    setDepartmentName("");
    setDescription("");
    setEditIndex(null);
    setOpen(false);
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      setDepartments((departments) =>
        departments.filter((_, idx) => idx !== deleteIndex),
      );
      setDeleteIndex(null);
      setDeleteDialogOpen(false);
    }
  };

  return {
    departmentName,
    setDepartmentName,
    description,
    setDescription,
    open,
    setOpen,
    departments,
    setDepartments,
    editIndex,
    setEditIndex,
    deleteIndex,
    setDeleteIndex,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleSave,
    handleEdit,
    handleClose,
    handleDelete,
  };
}
