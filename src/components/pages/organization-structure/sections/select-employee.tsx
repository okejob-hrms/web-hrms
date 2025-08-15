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

interface SelectEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (employee: EmployeeNode) => void;
}

export function SelectEmployeeModal({
  open,
  onClose,
  onSelect,
}: SelectEmployeeModalProps) {
  const [search, setSearch] = useState("");

  const employees: EmployeeNode[] = [
    {
      id: "e1",
      name: "Jane Doe",
      title: "Engineer",
      image: "https://via.placeholder.com/40",
    },
    {
      id: "e2",
      name: "Mark Smith",
      title: "Designer",
      image: "https://via.placeholder.com/40",
    },
  ];

  const filtered = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Karyawan</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Cari nama karyawan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(emp);
                onClose();
              }}
            >
              {/* <img src={emp.image} alt={emp.name} className="w-10 h-10 rounded-full" /> */}
              <div>
                <p className="font-medium">{emp.name}</p>
                <p className="text-sm text-gray-500">{emp.title}</p>
              </div>
            </div>
          ))}
        </div>
        <Button onClick={onClose} variant="outline" className="mt-4 w-full">
          Batal
        </Button>
      </DialogContent>
    </Dialog>
  );
}
