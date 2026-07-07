"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, stringAvatar } from "@/lib/utils";
import { IEmployeeResponse } from "@/services/employees/types";
import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDate } from "@/lib/formatting";
import { resolveLocale } from "@/lib/i18n/locale";
import { usePerformanceSelfAssessmentForm } from "../hook";
import { Skeleton } from "@/components/ui/skeleton";
import DataTable from "@/components/tables/data-table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "@/services/employees";

interface ModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  currentFormIndex: number | null;
  assessmentForms: Array<{
    id: string;
    formId?: string;
    selectedParticipants: string[];
  }>;
  onUpdateSelectedParticipants: (participantIds: string[]) => void;
}

export const ParticipantListModal = React.memo(function ParticipantListModal({
  isOpen,
  onClose,
  currentFormIndex,
  assessmentForms,
  onUpdateSelectedParticipants,
}: ModalProps) {
  const locale = resolveLocale(useLocale());
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");
  const tEmployee = useTranslations("employee");
  const {
    isLoadingEmployees,
    employeeList,
    pagination,
    handlePaginationChange,
    handleSearchChange,
    filters,
    totalEmployees,
  } = usePerformanceSelfAssessmentForm();

  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(
    new Set(),
  );

  const { data: allEmployees, isLoading: isLoadingAllEmployees } = useQuery({
    queryKey: ["participants"],
    queryFn: () => getEmployees({ page: 1, per_page: 10 }),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: isOpen,
  });

  React.useEffect(() => {
    if (isOpen && currentFormIndex !== null) {
      const currentForm = assessmentForms[currentFormIndex];
      setSelectedRows(new Set(currentForm.selectedParticipants));
    }
  }, [isOpen, currentFormIndex, assessmentForms]);

  React.useEffect(() => {
    if (!isOpen) {
      handleSearchChange("");
    }
  }, [isOpen, handleSearchChange]);

  const handleRowSelection = (employeeId: string, checked: boolean) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(employeeId);
      } else {
        newSet.delete(employeeId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    if (checked === true) {
      const allIds =
        allEmployees?.data?.data?.map((emp) => emp.user_id.toString()) || [];
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSave = () => {
    onUpdateSelectedParticipants(Array.from(selectedRows));
    onClose(false);
  };

  const handleCancel = () => {
    onClose(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  };

  const columns: ColumnDef<IEmployeeResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "selected",
        header: () => {
          const totalEmployeeCount = allEmployees?.data?.total || 0;
          const allEmployeeIds =
            allEmployees?.data?.data?.map((emp) => emp.user_id.toString()) || [];
          const isAllSelected =
            totalEmployeeCount > 0 &&
            allEmployeeIds.length > 0 &&
            allEmployeeIds.every((user_id) => selectedRows.has(user_id));
          const isSomeSelected = selectedRows.size > 0 && !isAllSelected;

          return (
            <Checkbox
              checked={
                isAllSelected ? true : isSomeSelected ? "indeterminate" : false
              }
              onCheckedChange={handleSelectAll}
            />
          );
        },
        size: 5,
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRows.has(row.original.user_id.toString())}
            onCheckedChange={(checked) =>
              handleRowSelection(
                row.original.user_id.toString(),
                checked as boolean,
              )
            }
          />
        ),
      },
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
              <span className="text-text-secondary">{row.original.id}</span>
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
        header: tEmployee("phoneNumber"),
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
        header: tEmployee("joinDate"),
        cell: ({ row }) =>
          formatDate(row.original.start_date, locale, {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
      },
    ],
    [
      allEmployees?.data?.data,
      allEmployees?.data?.total,
      locale,
      selectedRows,
      t,
      tCommon,
      tEmployee,
    ],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white md:min-w-5xl overflow-y-scroll max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("assignParticipant")}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {isLoadingEmployees ? (
            <div className="flex flex-col gap-4 items-center w-full">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-30 w-full" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center gap-2">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold text-xl">
                    {tEmployee("listTitle")}
                  </h2>
                  <div className="rounded-full bg-primary-background py-1 px-1.5 text-primary text-xs">
                    <span>
                      {t("employeesSelected", {
                        selected: selectedRows.size,
                        total: totalEmployees || 0,
                      })}
                    </span>
                  </div>
                </div>
                <Input
                  placeholder={tCommon("search")}
                  className="max-w-80"
                  value={filters?.search || ""}
                  onChange={handleSearch}
                />
              </div>
              <DataTable
                columns={columns}
                data={employeeList?.data || []}
                pagination={employeeList}
                paginationState={pagination}
                setPaginationState={handlePaginationChange}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={handleCancel} type="button">
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleSave} type="button">
              {t("saveSelection")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
