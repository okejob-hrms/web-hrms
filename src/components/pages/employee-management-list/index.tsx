/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { formatDate } from "@/lib/formatting";
import { resolveLocale } from "@/lib/i18n/locale";
import { Toolbar } from "./sections/toolbar";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
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
import Link from "next/link";
import { IEmployeeResponse } from "@/services/employees/types";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/services/employees";
import { Filters } from "./types";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { EmployeeImportDialog } from "./sections/import/import-dialog";
import { Can } from "@/components/auth/can";

export default function EmployeeManagementList() {
  const router = useRouter();
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState<Filters>({
    department_ids: [],
    job_position_ids: [],
    search: "",
  });
  const [isImportOpen, setIsImportOpen] = React.useState(false);

  const columns = React.useMemo<ColumnDef<IEmployeeResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: tCommon("name"),
        cell: ({ row }) => (
          <div className="flex gap-4 items-center min-w-[150px]">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={`${process.env.NEXT_PUBLIC_FILE_URL}/${row.original.photo_profile}`}
              />
              <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                {stringAvatar(row.original.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">
                {row.original.name}
              </span>
              <span className="text-text-secondary">{row.original.code}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "job_position",
        header: tCommon("position"),
      },
      {
        accessorKey: "department",
        header: tCommon("department"),
      },
      {
        accessorKey: "email",
        header: tCommon("email"),
      },
      {
        accessorKey: "phone_number",
        header: t("phoneNumber"),
      },
      {
        accessorKey: "status",
        header: tCommon("status"),
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
                {status === 1 ? tCommon("active") : tCommon("inactive")}
              </span>
            </Badge>
          );
        },
      },
      {
        accessorKey: "start_date",
        header: t("joinDate"),
        cell: ({ row }) => formatDate(row.original.start_date, locale),
      },
      {
        accessorKey: "menu",
        header: "",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis className="text-grayscale-30" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Link
                    href={`/employee/employee-management/${row.original.id}`}
                    className="flex gap-2 w-full"
                  >
                    <Image
                      src="/icons/eyeVisibleGrey.svg"
                      height={16}
                      width={16}
                      alt="icon-eye"
                    />
                    {t("employeeDetails")}
                  </Link>
                </DropdownMenuItem>
                <Can permission="employee_organization.employee_profile.edit">
                  <DropdownMenuItem>
                    <Link
                      href={`/employee/employee-management/edit/${row.original.id}`}
                      className="flex gap-2 w-full"
                    >
                      <Image
                        src="/icons/editGrey.svg"
                        height={16}
                        width={16}
                        alt="icon-edit"
                      />
                      {tCommon("edit")}
                    </Link>
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, tCommon, locale],
  );

  const debouncedFilters = useDebounce(filters, 300);
  const queryParams = React.useMemo(
    () => ({
      ...debouncedFilters,
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    }),
    [debouncedFilters, pagination],
  );

  const { data: employees, isLoading } = useQuery({
    queryKey: ["employees", queryParams],
    queryFn: () => getEmployees(queryParams),
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

    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  const handlePaginationChange = React.useCallback((updater: any) => {
    setPagination(updater);
  }, []);

  return (
    <div className="flex flex-col justify-between gap-6 p-4">
      <Toolbar onFiltersChange={handleFiltersChange} />
      <Separator />
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 p-6 flex flex-col gap-4">
        <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
          <div className="flex gap-2 items-center">
            <h2 className="font-semibold text-xl">{t("listTitle")}</h2>
            <Badge className="bg-primary-background text-primary rounded-full">
              {t("employeeCount", { count: employees?.data.total || 0 })}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Can permission="employee_organization.employee_profile.create">
              <Button
                variant="outline"
                onClick={() => setIsImportOpen(true)}
                className="flex gap-2"
              >
                <Image
                  src="/icons/attachmentBlue.svg"
                  height={16}
                  width={16}
                  alt="icon-import"
                />
                {tCommon("import")}
              </Button>
            </Can>
            <Can permission="employee_organization.employee_profile.create">
              <Button
                onClick={() => router.push("/employee/employee-management/add")}
              >
                {t("newEmployee")}
              </Button>
            </Can>
          </div>
        </div>
        <EmployeeImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
        />
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
            data={employees?.data.data || []}
            pagination={employees?.data}
            paginationState={pagination}
            setPaginationState={handlePaginationChange}
          />
        )}
      </div>
    </div>
  );
}
