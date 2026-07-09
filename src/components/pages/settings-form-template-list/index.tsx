"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, ChevronsUpDown, Ellipsis, Search } from "lucide-react";
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
import { useFormTemplateList } from "./hook";
import { IFormTemplate } from "@/services/form/types";
import FormDeleteModal from "./sections/delete-modal";
import { FormAddModal } from "./sections/add-modal";
import { Input } from "@/components/ui/input";

export default function FormTemplateList() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = resolveLocale(useLocale());
  const {
    forms,
    apiPagination,
    loading,
    pagination,
    setPagination,
    filters,
    handleFiltersChange,
    handleNew,
    openDelete,
    setOpenDelete,
    openAdd,
    setOpenAdd,
    handleDelete,
    setSelectedId,
    formOptions,
    handleSave,
  } = useFormTemplateList();

  const columns = React.useMemo<ColumnDef<IFormTemplate>[]>(
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
              <span>{t("formName")}</span>
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
        accessorKey: "type_label",
        header: t("formUsage"),
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
                    href={`/settings/form-template/${row.original.id}`}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Image
                      src="/icons/eyeVisibleGrey.svg"
                      height={16}
                      width={16}
                      alt="icon-eye"
                    />
                    {t("formDetails")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link
                    href={`/settings/form-template/edit/${row.original.id}`}
                    className="flex gap-2 justify-baseline items-center w-full"
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
                <DropdownMenuItem>
                  <button
                    className="flex gap-2 justify-baseline items-center w-full cursor-pointer"
                    onClick={() => {
                      setSelectedId(String(row.original.id));
                      setOpenDelete(true);
                    }}
                  >
                    <Image
                      src="/icons/delete.svg"
                      height={16}
                      width={16}
                      alt="icon-edit"
                    />
                    {tCommon("delete")}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [t, tCommon, locale, setSelectedId, setOpenDelete],
  );

  const isMobile = useIsMobile();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="font-semibold text-xl">{t("formList")}</h2>
            </div>
            <Button onClick={() => handleNew()} className="whitespace-nowrap">
              {t("newForm")}
            </Button>
          </div>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input
              placeholder={t("searchForm")}
              className="pl-9"
              value={filters.search}
              onChange={(e) => handleFiltersChange({ search: e.target.value })}
            />
          </div>
          <DataTable
            columns={columns}
            data={forms}
            customSize={!isMobile}
            loading={loading}
            apiPagination={apiPagination}
            paginationState={pagination}
            setPaginationState={setPagination}
          />
        </div>
      </div>
      <FormDeleteModal
        onDelete={() => handleDelete()}
        isOpen={openDelete}
        setIsOpen={(e) => setOpenDelete(e)}
      />
      <FormAddModal
        formOptions={formOptions}
        open={openAdd}
        onOpenChange={setOpenAdd}
        onSave={handleSave}
      />
    </div>
  );
}
