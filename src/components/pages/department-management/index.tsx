"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useDepartmentManagement } from "@/components/pages/department-management/hooks/useDepartmentManagement";
import DepartmentModal from "./sections/edit-modal";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/tables/row-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateTime } from "@/lib/formatting";
import { resolveLocale } from "@/lib/i18n/locale";
import DeleteDepartmentDialog from "./sections/delete-modal";
import { DepartmentResponse } from "@/services/department/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Can } from "@/components/auth/can";

export default function DepartmentManagementList() {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());
  const {
    departments,
    isLoading,
    isEditModalOpen,
    setEditModalOpen,
    isDeleteDialogOpen,
    setDeleteDialogOpen,
    selectedDepartment,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleSave,
    handleDeleteConfirm,
    handleClose,
    pagination,
    setPagination,
  } = useDepartmentManagement();

  const columns = React.useMemo<ColumnDef<DepartmentResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("departmentName"),
        size: 300,
      },
      {
        accessorKey: "description",
        header: tCommon("description"),
        size: 480,
      },
      {
        accessorKey: "lastUpdate",
        header: tCommon("lastUpdate"),
        size: 160,
        cell: ({ row }) => {
          const { date, hour } = formatDateTime(row.original.updated_at, locale);

          return (
            <div>
              <span>{date}</span>
              <br />
              <span>{hour}</span>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "",
        size: 80,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex justify-end">
              <RowActions
                onEdit={() => {
                  handleEdit(item);
                }}
                onDelete={() => {
                  handleDeleteClick(item);
                }}
                editPermission="employee_organization.employee_assignment.edit"
                deletePermission="employee_organization.employee_assignment.delete"
              />
            </div>
          );
        },
      },
    ],
    [t, tCommon, locale, handleEdit, handleDeleteClick],
  );

  const isMobile = useIsMobile();
  const departmentCount =
    pagination.pageIndex * pagination.pageSize +
    (departments?.data?.data?.length ?? 0);

  return (
    <div className="flex flex-col justify-between gap-6">
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex gap-2 items-center flex-wrap">
            <h2 className="font-semibold text-xl">{t("departmentList")}</h2>
            <Badge className="bg-primary-background text-primary rounded-full">
              {t("departmentCount", { count: departmentCount })}
            </Badge>
          </div>
          <Can permission="employee_organization.employee_assignment.create">
            <Button onClick={handleCreate} className="whitespace-nowrap">
              {t("newDepartment")}
            </Button>
          </Can>
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
            data={departments?.data?.data}
            customSize={!isMobile}
            pagination={departments?.data}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        )}
      </div>
      <DeleteDepartmentDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteConfirm}
        isLoading={isLoading}
      />
      <DepartmentModal
        open={isEditModalOpen}
        onOpenChange={setEditModalOpen}
        initialData={selectedDepartment}
        handleSave={handleSave}
        handleClose={handleClose}
        isLoading={isLoading}
      />
    </div>
  );
}
