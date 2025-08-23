"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Toolbar } from "./sections/toolbar";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, stringAvatar } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { IEmployeeResponse } from "@/services/employees/types";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/services/employees";
import { Filters } from "./types";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";

export const columns: ColumnDef<IEmployeeResponse>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex gap-4 items-center min-w-[150px]">
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.original.photo_profile} />
          <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
            {stringAvatar(row.original.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">
            {row.original.name}
          </span>
          <span className="text-text-secondary">{row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "job_position",
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
    accessorKey: "phone_number",
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
            status === 1 ? "bg-success-focused " : "bg-error-focused ",
          )}
        >
          <div
            className={cn(
              "size-2 rounded-full",
              status === 1 ? "bg-success" : "bg-error",
            )}
          />
          <span className={cn(status === 1 ? "text-success" : "text-error")}>
            {status === 1 ? "Active" : "Inactive"}
          </span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "start_date",
    header: "Join Date",
    cell: ({ row }) => {
      const date = new Date(row.original.start_date);
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "menu",
    header: "",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Ellipsis className="text-grayscale-30" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link
                href="/employee/employee-management/detail"
                className="flex justify-between items-center"
              >
                <Icon name="eyeVisible" size={24} color="currentColor" />
                Employee Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="#" className="flex justify-between items-center">
                <Icon name="edit" size={24} color="currentColor" />
                Edit
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
export default function EmployeeManagementList() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<Filters>({
    department_ids: [],
    job_position_ids: [],
    search: "",
  });
  const debouncedFilters = useDebounce(filters, 300);

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees", debouncedFilters],
    queryFn: () => getEmployees(debouncedFilters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleFiltersChange = React.useCallback((newFilters: Filters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      department_ids:
        newFilters.department_ids !== prev.department_ids
          ? newFilters.department_ids
          : prev.department_ids,
      job_position_ids:
        newFilters.job_position_ids !== prev.job_position_ids
          ? newFilters.job_position_ids
          : prev.job_position_ids,
    }));
  }, []);

  return (
    <div className="flex flex-col justify-between gap-6 p-4">
      <Toolbar onFiltersChange={handleFiltersChange} />
      <Separator />
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4">
        <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
          <div className="flex gap-2 items-center">
            <h2 className="font-semibold text-xl">Employee List</h2>
            <Badge className="bg-primary-background text-primary rounded-full">
              {employees?.data.data.length} Employee
            </Badge>
          </div>
          <Button
            onClick={() => router.push("/employee/employee-management/add")}
          >
            + New Employee
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
            data={employees?.data.data}
            pagination={employees?.data}
          />
        )}
      </div>
    </div>
  );
}
