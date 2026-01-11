/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import { usePerformanceCompetencyDetails } from "./hook";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Ellipsis } from "lucide-react";
import Image from "next/image";
import { CompetencyModalForm } from "./sections/modal-form";
import { Separator } from "@/components/ui/separator";
import DeleteDialog from "./sections/delete-modal";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export const SettingsPerformanceCompetencyDetails = React.memo(
  function SettingsPerformanceCompetencyDetails() {
    const isMobile = useIsMobile();
    const {
      handleAddNew,
      handleEditClick,
      isOpenModalForm,
      setIsOpenModalForm,
      handleSave,
      competencyDetails,
      competencyLevels,
      isLoadingDetails,
      isLoadingLevels,
      form,
      isSubmitting,
      isEditing,
      isOpenDeleteModal,
      setIsOpenDeleteModal,
      handleDeleteClick,
      handleDeleteConfirm,
      isDeleting,
    } = usePerformanceCompetencyDetails();

    const columns: ColumnDef<any>[] = [
      {
        accessorKey: "dimensions",
        header: "Dimensions",
      },
      {
        accessorKey: "level",
        header: "Level",
      },
      {
        accessorKey: "name",
        header: "Level Name",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "menu",
        header: "",
        size: 50,
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Ellipsis className="text-grayscale-30" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => handleEditClick(row.original.id)}
                  className="flex gap-2 justify-start items-center w-full cursor-pointer"
                >
                  <Image
                    src="/icons/editGrey.svg"
                    height={16}
                    width={16}
                    alt="icon-edit"
                  />
                  Edit Level
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleDeleteClick(row.original.id)}
                  className="flex gap-2 cursor-pointer"
                >
                  <Image
                    src="/icons/delete.svg"
                    height={16}
                    width={16}
                    alt="icon-delete"
                  />
                  Delete Level
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];

    if (isLoadingDetails) {
      return <Skeleton />;
    }

    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <div className="flex flex-row gap-2 items-center">
          <h1 className="font-semibold text-lg text-black">Competencies</h1>
          <Link href={`/settings/competencies`}>
            <Button className="font-semibold text-primary" variant="ghost">
              <Edit />
              Edit
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Competency Code</p>
            <p>{competencyDetails?.code || "-"}</p>
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-text-disabled">Competency Name</p>
            <p>{competencyDetails?.name || "-"}</p>
          </div>
          <div className="flex flex-col md:col-start-1 md:col-span-3">
            <p className="text-sm text-text-disabled">Description</p>
            <p>{competencyDetails?.description || "-"}</p>
          </div>
        </div>
        <Separator />
        <div className="flex flex-col justify-between gap-6">
          <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
              <div className="flex gap-2 items-center flex-wrap">
                <h2 className="font-semibold text-xl">Level</h2>
              </div>
              <Button
                onClick={() => handleAddNew()}
                className="whitespace-nowrap"
              >
                + Add Level
              </Button>
            </div>
            <DataTable
              columns={columns}
              data={competencyLevels || []}
              customSize={!isMobile}
              loading={isLoadingLevels}
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
