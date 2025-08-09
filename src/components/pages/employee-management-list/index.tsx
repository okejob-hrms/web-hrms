"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { EmployeeListTable } from "./components/table";
import { useRouter } from "next/navigation";
import { Toolbar } from "./components/toolbar";
import { GeneralPagination } from "../ui/pagination";
import { IEmployee } from "@/lib/types";

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

export default function EmployeeManagementList() {
  const router = useRouter();
  return (
    <div className="font-sans min-h-screen">
      <div className="flex flex-col justify-between gap-6">
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
            <Button
              onClick={() => router.push("/dashboard/employee-management/add")}
            >
              + New Employee
            </Button>
          </div>
          <EmployeeListTable data={employees} />
          <Separator />
          <GeneralPagination />
        </div>
      </div>
    </div>
  );
}
