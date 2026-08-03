"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { DataTable } from "@/components/tables/data-table";
import { ICompanyBranches } from "@/services/settings/types";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, ChevronsUpDown, Ellipsis } from "lucide-react";
import { formatDateTime } from "@/lib/formatting";
import { resolveLocale } from "@/lib/i18n/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { useCompanyBranchList } from "./hook";
import DeleteDialog from "./sections/delete-modal";
import { Can } from "@/components/auth/can";

export default function SettingsCompanyBranchList() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());
  const {
    branches,
    apiPagination,
    pagination,
    setPagination,
    loading,
    handleEdit,
    handleNew,
    handleDeleteBranch,
    handleOpenDeleteModal,
    isDeleteModal,
    mutateDeleteBranch,
    setIsDeleteModal,
  } = useCompanyBranchList();

  const columns = React.useMemo<ColumnDef<ICompanyBranches>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          const SortIcon = () =>
            isSorted === "asc" ? (
              <ArrowUp className="w-3 h-3" />
            ) : isSorted === "desc" ? (
              <ArrowDown className="w-3 h-3" />
            ) : (
              <ChevronsUpDown className="w-3 h-3 opacity-50" />
            );

          return (
            <div className="flex flex-row gap-2 items-center">
              <span>{t("companyName")}</span>
              <button
                type="button"
                onClick={() => column.toggleSorting(isSorted === "asc")}
                className="flex items-center gap-1"
              >
                <SortIcon />
              </button>
            </div>
          );
        },
        size: 300,
      },
      {
        accessorKey: "lastUpdate",
        header: tCommon("lastUpdate"),
        size: 300,
        cell: ({ row }) => {
          const { date, hour } = formatDateTime(row.original.updated_at, locale);
          return (
            <div>
              <span>
                {date} {hour}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "is_primary",
        header: t("isPrimary"),
        cell: ({ row }) => {
          return (
            <div>
              <span>
                {row.original.is_primary ? tCommon("yes") : tCommon("no")}
              </span>
            </div>
          );
        },
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
                    href={`/settings/company/company-branch/${row.original.id}`}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Image
                      src="/icons/eyeVisibleGrey.svg"
                      height={16}
                      width={16}
                      alt="icon-eye"
                    />
                    {t("branchDetails")}
                  </Link>
                </DropdownMenuItem>
                <Can permission="general_settings.company_branch.edit">
                  <DropdownMenuItem>
                    <Link
                      href={`/settings/company/company-branch/edit/${row.original.id}`}
                      className="flex gap-2 justify-start items-center w-full"
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
                <Can permission="general_settings.company_branch.delete">
                  <DropdownMenuItem
                    className="flex gap-2 items-center"
                    onClick={() =>
                      handleOpenDeleteModal(row.original.id.toString())
                    }
                  >
                    <Image
                      src="/icons/delete.svg"
                      height={16}
                      width={16}
                      alt="icon-edit"
                    />
                    {tCommon("delete")}
                  </DropdownMenuItem>
                </Can>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, tCommon, locale, handleOpenDeleteModal],
  );

  const isMobile = useIsMobile();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="font-semibold text-xl">{t("companyBranch")}</h2>
            </div>
            <Can permission="general_settings.company_branch.create">
              <Button onClick={() => handleNew()} className="whitespace-nowrap">
                {t("newBranch")}
              </Button>
            </Can>
          </div>
          <DataTable
            columns={columns}
            data={branches}
            customSize={!isMobile}
            apiPagination={apiPagination}
            paginationState={pagination}
            setPaginationState={setPagination}
            loading={loading}
          />
        </div>
      </div>
      <DeleteDialog
        open={isDeleteModal}
        onOpenChange={setIsDeleteModal}
        onDelete={handleDeleteBranch}
        isLoading={mutateDeleteBranch.isPending}
      />
    </div>
  );
}
