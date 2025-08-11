"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Toolbar } from "./components/toolbar";
import { IEmployee } from "@/lib/types";
import { GeneralPagination } from "@/components/ui/pagination";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const employees: IEmployee[] = [
  {
    firstName: "Alice",
    lastName: "Johnson",
    employeeId: "EMP001",
    position: "Software Engineer",
    department: "Engineering",
    email: "alice.johnson@example.com",
    phoneNo: "+62 812-3456-7890",
    status: "active",
    joinDate: "2022-03-15",
    image:
      "https://images.unsplash.com/photo-1550525811-e5869dd03032?crop=faces&fit=crop&h=200&w=200",
  },
  {
    firstName: "Bob",
    lastName: "Smith",
    employeeId: "EMP002",
    position: "Product Manager",
    department: "Product",
    email: "bob.smith@example.com",
    phoneNo: "+62 813-4567-8901",
    status: "on_leave",
    joinDate: "2021-11-01",
    image:
      "https://images.unsplash.com/photo-1544723495-432537d5a1a4?crop=faces&fit=crop&h=200&w=200",
  },
  {
    firstName: "Clara",
    lastName: "Tan",
    employeeId: "EMP003",
    position: "UX Designer",
    department: "Design",
    email: "clara.tan@example.com",
    phoneNo: "+62 814-5678-9012",
    status: "active",
    joinDate: "2023-01-20",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=faces&fit=crop&h=200&w=200",
  },
  {
    firstName: "Daniel",
    lastName: "Wirawan",
    employeeId: "EMP004",
    position: "Finance Analyst",
    department: "Finance",
    email: "daniel.wirawan@example.com",
    phoneNo: "+62 815-6789-0123",
    status: "inactive",
    joinDate: "2020-07-12",
    image:
      "https://images.unsplash.com/photo-1502767089025-6572583495b9?crop=faces&fit=crop&h=200&w=200",
  },
  {
    firstName: "Eva",
    lastName: "Lestari",
    employeeId: "EMP005",
    position: "HR Specialist",
    department: "Human Resources",
    email: "eva.lestari@example.com",
    phoneNo: "+62 816-7890-1234",
    status: "active",
    joinDate: "2024-04-30",
    image:
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?crop=faces&fit=crop&h=200&w=200",
  },
];
export const columns: ColumnDef<IEmployee>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        <Avatar>
          <AvatarImage src={row.original.image} />
        </Avatar>
        <div className="flex flex-col">
          <span>
            {row.original.firstName} {row.original.lastName}
          </span>
          <span>{row.original.employeeId}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNo",
    header: "Phone Number",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant="default"
          className={cn(
            "rounded-full",
            status === "active" ? "bg-success-focused " : "bg-error-focused ",
          )}
        >
          <div
            className={cn(
              "size-2 rounded-full",
              status === "active" ? "bg-success" : "bg-error",
            )}
          />
          <span
            className={cn(status === "active" ? "text-success" : "text-error")}
          >
            {status === "active" ? "Active" : "Inactive"}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "joinDate",
    header: "Join Date",
    cell: ({ row }) => {
      const date = new Date(row.original.joinDate);
      return date.toLocaleDateString();
    },
  },
];
export default function EmployeeManagementList() {
  const router = useRouter();
  return (
    <div className="flex flex-col justify-between gap-6 p-4">
      <Toolbar />
      <Separator />
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4">
        <div className="flex justify-between w-full items-center">
          <div className="flex gap-2 items-center">
            <h2 className="font-semibold text-xl">Employee List</h2>
            <Badge className="bg-primary-background text-primary rounded-full">
              {employees.length} Employee
            </Badge>
          </div>
          <Button onClick={() => router.push("/employee-management/add")}>
            + New Employee
          </Button>
        </div>
        <DataTable columns={columns} data={employees} />
        <Separator />
        <GeneralPagination />
      </div>
    </div>
  );
}
