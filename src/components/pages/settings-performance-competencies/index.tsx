/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { usePerformanceCompetenciesList } from "./hook";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { CompetencyModalForm } from "./sections/modal-form";
import DeleteDialog from "./sections/delete-modal";

export const SettingsPerformanceCompetencies = React.memo(
  function SettingsPerformanceCompetencies() {
    const isMobile = useIsMobile();
    const {
      handleAddNew,
      handleEditClick,
      isOpenModalForm,
      setIsOpenModalForm,
      performanceCompetencies,
      form,
      handleSave,
      isSubmitting,
      isEditing,
      isOpenDeleteModal,
      setIsOpenDeleteModal,
      handleDeleteClick,
      handleDeleteConfirm,
      isDeleting,
      paginationState,
      setPagination,
    } = usePerformanceCompetenciesList();

    const columns: ColumnDef<any>[] = [
      {
        accessorKey: "code",
        header: "Code",
      },
      {
        accessorKey: "name",
        header: "Competencies",
      },
      {
        accessorKey: "description",
        header: "Description",
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
                    href={`/settings/competencies/${row.original.id}`}
                    className="flex gap-2 justify-between items-center"
                  >
                    <Image
                      src="/icons/eyeVisibleGrey.svg"
                      height={16}
                      width={16}
                      alt="icon-eye"
                    />
                    Competency Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    className="flex gap-2 justify-between items-center"
                    onClick={() => handleEditClick(row.original.id)}
                  >
                    <Image
                      src="/icons/editGrey.svg"
                      height={16}
                      width={16}
                      alt="icon-edit"
                    />
                    Edit Competency
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    className="flex gap-2"
                    onClick={() => handleDeleteClick(row.original.id)}
                  >
                    <Image
                      src="/icons/delete.svg"
                      height={16}
                      width={16}
                      alt="icon-edit"
                    />
                    Delete Competency
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];

    return (
      <div className="font-sans min-h-screen bg-gray-50">
        <div className="flex flex-col justify-between gap-6">
          <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex gap-2 items-center flex-wrap">
                <h2 className="font-semibold text-xl">Competencies</h2>
              </div>
              <Button
                onClick={() => handleAddNew()}
                className="whitespace-nowrap"
              >
                + New Performance Competency
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={performanceCompetencies?.data.data || []}
              customSize={!isMobile}
              pagination={performanceCompetencies?.data}
              paginationState={paginationState}
              setPaginationState={setPagination}
            />
          </div>
        </div>
        <CompetencyModalForm
          open={isOpenModalForm}
          onOpenChange={setIsOpenModalForm}
          form={form}
          handleSave={handleSave}
          isSubmitting={isSubmitting}
          isEditing={isEditing}
        />
        <DeleteDialog
          open={isOpenDeleteModal}
          onOpenChange={setIsOpenDeleteModal}
          onDelete={handleDeleteConfirm}
          isLoading={isDeleting}
        />
      </div>
    );
  },
);
