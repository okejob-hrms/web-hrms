"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import DepartmentModal from "./sections/edit-modal";
import { DataTable } from "@/components/tables/data-table";
import { IDepartment } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { RowActions } from "@/components/tables/row-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import { useTeamManagement } from "./hooks/useTeamManagement";
import { formatDateTime } from "@/lib/helpers";
import DeleteDialog from "../sections/delete-modal";

export default function TeamManagementList() {
  const {
    setTeamName,
    setDescription,
    open,
    setOpen,
    teams,
    editIndex,
    handleSave,
    handleClose,
    deleteDialogOpen,
    setDeleteDialogOpen,
    setDeleteIndex,
    handleDelete,
    handleEdit,
  } = useTeamManagement();

  const columns: ColumnDef<IDepartment>[] = [
    {
      accessorKey: "name",
      header: "Team Name",
      size: 300,
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 480,
    },
    {
      accessorKey: "lastUpdate",
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
          <div className="flex flex-row gap-2">
            <span>Last Update</span>
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
      size: 160,
      cell: ({ row }) => {
        const { date, hour } = formatDateTime(row.original.updated_at);

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
              handleEdit(item.id);
            }}
            onDelete={() => {
              setDeleteIndex(item.id);
              setDeleteDialogOpen(true);
            }}
          />
        );
      },
    },
  ];

  const isMobile = useIsMobile();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      {/* Outer container: center content, limit max width, add horizontal padding */}
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col justify-between gap-6">
          <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
            <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
              {/* Header Left */}
              <div className="flex gap-2 items-center flex-wrap">
                <h2 className="font-semibold text-xl">Teams</h2>
              </div>
              {/* Button */}
              <Button
                onClick={() => {
                  setOpen(true);
                  setTeamName("");
                  setDescription("");
                }}
                className="whitespace-nowrap"
              >
                + New Team
              </Button>
            </div>
            <DataTable columns={columns} data={teams} customSize={!isMobile} />
          </div>
        </div>
      </div>
      {/* Modals */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        title="Are you sure you want to delete this team?"
        description="Deleting this team may affect any existing job position
            mappings linked to it. If mappings have been set up, you’ll need to
            reassign affected positions manually."
        confirmText="Delete Team"
      />
      <DepartmentModal
        open={open}
        onOpenChange={setOpen}
        editIndex={editIndex}
        handleSave={handleSave}
        handleClose={handleClose}
      />
    </div>
  );
}
