"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/tables/row-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDateTime } from "@/lib/formatting";
import { resolveLocale } from "@/lib/i18n/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { JobLevel } from "@/services/job-levels/types";
import { useJobLevels } from "./hooks/useJobLevel";
import DeleteJobLevelDialog from "./sections/delete-modal";
import JobLevelModal from "./sections/edit-modal";
import { Can } from "@/components/auth/can";

export default function JobLevelList() {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());
  const {
    job_levels,
    isLoading,
    isEditModalOpen,
    setEditModalOpen,
    isDeleteDialogOpen,
    setDeleteDialogOpen,
    selectedJobLevel,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleSave,
    handleDeleteConfirm,
    handleClose,
    pagination,
    setPagination,
  } = useJobLevels();

  const columns = React.useMemo<ColumnDef<JobLevel>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("jobLevel"),
        size: 300,
      },
      {
        accessorKey: "level",
        header: t("level"),
        size: 300,
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
                editPermission="employee_organization.job_leveling_dictionary.edit"
                deletePermission="employee_organization.job_leveling_dictionary.delete"
              />
            </div>
          );
        },
      },
    ],
    [t, tCommon, locale, handleEdit, handleDeleteClick],
  );

  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col justify-between gap-6">
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
        <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
          <div className="flex gap-2 items-center flex-wrap">
            <h2 className="font-semibold text-xl">{t("jobLevels")}</h2>
          </div>
          <Can permission="employee_organization.job_leveling_dictionary.create">
            <Button onClick={handleCreate} className="whitespace-nowrap">
              {t("newJobLevel")}
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
            data={job_levels?.data}
            customSize={!isMobile}
            pagination={job_levels}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        )}
      </div>
      <DeleteJobLevelDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteConfirm}
        isLoading={isLoading}
      />
      <JobLevelModal
        open={isEditModalOpen}
        onOpenChange={setEditModalOpen}
        initialData={selectedJobLevel}
        handleSave={handleSave}
        handleClose={handleClose}
        isLoading={isLoading}
      />
    </div>
  );
}
