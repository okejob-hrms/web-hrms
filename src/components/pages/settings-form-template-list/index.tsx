"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, ChevronsUpDown, Ellipsis } from "lucide-react";
import { formatDateTime } from "@/lib/helpers";
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

export default function FormTemplateList() {
  const {
    forms,
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
  const columns: ColumnDef<IFormTemplate>[] = [
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
            <span>Form Name</span>
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
      header: "Form Usage",
      size: 300,
    },
    {
      accessorKey: "lastUpdate",
      header: "Last Update",
      size: 300,
      cell: ({ row }) => {
        const { date, hour } = formatDateTime(row.original.updated_at);
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
                  Form Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/settings/form-template/edit/${row.original.id}`}
                  className="flex gap-2 justify-between items-center"
                >
                  <Image
                    src="/icons/editGrey.svg"
                    height={16}
                    width={16}
                    alt="icon-edit"
                  />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  className="flex gap-2"
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
                  Delete
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const isMobile = useIsMobile();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="font-semibold text-xl">Form List</h2>
            </div>
            <Button onClick={() => handleNew()} className="whitespace-nowrap">
              + New Form
            </Button>
          </div>
          <DataTable columns={columns} data={forms} customSize={!isMobile} />
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
