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
                href={`/settings/performance-competencies/${row.original.id}`}
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
              <Link
                href={`/settings/performance-competencies/edit/${row.original.id}`}
                className="flex gap-2 justify-between items-center"
              >
                <Image
                  src="/icons/editGrey.svg"
                  height={16}
                  width={16}
                  alt="icon-edit"
                />
                Edit Competency
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <button
                className="flex gap-2"
                // onClick={() => {
                //   setSelectedId(String(row.original.id));
                //   setOpenDelete(true);
                // }}
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

export const SettingsPerformanceCompetencies = React.memo(
  function SettingsPerformanceCompetencies() {
    const isMobile = useIsMobile();
    const {
      handleAddNew,
      isOpenModalForm,
      setIsOpenModalForm,
      performanceCompetencies,
    } = usePerformanceCompetenciesList();

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
              data={performanceCompetencies?.data || []}
              customSize={!isMobile}
            />
          </div>
        </div>
        <CompetencyModalForm
          open={isOpenModalForm}
          onOpenChange={setIsOpenModalForm}
        />
      </div>
    );
  },
);
