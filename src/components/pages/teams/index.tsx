"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import DepartmentModal from "./sections/edit-modal";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/tables/row-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTeamManagement } from "./hooks/useTeamManagement";
import { formatDateTime } from "@/lib/formatting";
import { resolveLocale } from "@/lib/i18n/locale";
import DeleteTeamDialog from "./sections/delete-modal";
import { TeamResponse } from "@/services/team/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamManagementList() {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());
  const {
    teams,
    isLoading,
    isEditModalOpen,
    setEditModalOpen,
    isDeleteDialogOpen,
    setDeleteDialogOpen,
    selectedteam,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleSave,
    handleDeleteConfirm,
    handleClose,
    pagination,
    setPagination,
  } = useTeamManagement();

  const columns = React.useMemo<ColumnDef<TeamResponse>[]>(
    () => [
      {
        accessorKey: "name",
        header: t("teamName"),
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
            <RowActions
              onEdit={() => {
                handleEdit(item);
              }}
              onDelete={() => {
                handleDeleteClick(item);
              }}
            />
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
            <h2 className="font-semibold text-xl">{t("teams")}</h2>
          </div>
          <Button onClick={handleCreate} className="whitespace-nowrap">
            {t("newTeam")}
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
            data={teams?.data?.data}
            customSize={!isMobile}
            pagination={teams?.data}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        )}
      </div>
      <DeleteTeamDialog
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDeleteConfirm}
        isLoading={isLoading}
      />
      <DepartmentModal
        open={isEditModalOpen}
        onOpenChange={setEditModalOpen}
        initialData={selectedteam}
        handleSave={handleSave}
        handleClose={handleClose}
        isLoading={isLoading}
      />
    </div>
  );
}
