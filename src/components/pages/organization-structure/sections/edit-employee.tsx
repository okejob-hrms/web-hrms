"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmployeeNode } from "../types";
import { useState } from "react";

interface EditEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employee: EmployeeNode;
  onSave: (updated: EmployeeNode) => void;
}

export function EditEmployeeModal({
  open,
  onClose,
  employee,
  onSave,
}: EditEmployeeModalProps) {
  const [form, setForm] = useState<EmployeeNode>(employee);

  const handleChange = (field: keyof EmployeeNode, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Data Karyawan</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Nama"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Jabatan"
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Email"
          value={form.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          className="mb-3"
        />
        <Input
          placeholder="Phone"
          value={form.phone || ""}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="mb-3"
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
