import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useKPIs } from "./hook";
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnDef } from "@tanstack/react-table";
import { IKPI } from "@/services/performances/kpi/types";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Edit2,
  Ellipsis,
  Eye,
  Search,
  Trash,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FormModal from "./sections/form-modal";
import { Input } from "@/components/ui/input";
import { DetailModal } from "./sections/detail-modal";
import { DeleteModal } from "./sections/delete-modal";

export default function PerformanceKPI() {
  const {
    data,
    isLoading,
    handleNew,
    handleDetail,
    handleDelete,
    handleEdit,
    handleSave,
    openForm,
    jobPositionOptions,
    jobLevelOptions,
    frequencyOptions,
    formatOptions,
    aggregationOptions,
    directionOptions,
    pagination,
    getFrequencyLabel,
    getDirectionLabel,
    formatTarget,
    searchTerm,
    setSearchTerm,
    paginationState,
    setPagination,
    kpiDetails,
    editKpiId,
    isLoadingDetails,
    handleCloseForm,
    openDetail,
    handleCloseDetail,
    kpiDetailData,
    openDelete,
    handleCloseDelete,
    handleConfirmDelete,
    deleteKpiId,
  } = useKPIs();

  const isMobile = useIsMobile();

  const columns: ColumnDef<IKPI>[] = [
    {
      accessorKey: "id",
      size: 50,
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
            <span>ID</span>
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
      cell: ({ row }) => <span>{row.original.id}</span>,
    },
    {
      accessorKey: "name",
      minSize: 270,
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
            <span>KPI Name</span>
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
      cell: ({ row }) => {
        return <span>{row.original.name}</span>;
      },
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ row }) => {
        return <span>{getFrequencyLabel(row.original.frequency)}</span>;
      },
    },
    {
      accessorKey: "direction",
      header: "Direction",
      cell: ({ row }) => {
        return <span>{getDirectionLabel(row.original.direction)}</span>;
      },
    },
    {
      accessorKey: "target",
      header: "Target",
      cell: ({ row }) => {
        return (
          <span>{formatTarget(row.original.target, row.original.format)}</span>
        );
      },
    },
    {
      maxSize: 70,
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Ellipsis className="text-grayscale-30" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    handleDetail(row.original);
                  }}
                  className="flex gap-2 w-full text-left"
                >
                  <Eye className="w-4 h-4" />
                  KPI Details
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    handleEdit(row.original.id);
                  }}
                  className="flex gap-2 w-full text-left"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit KPI
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  onClick={() => {
                    handleDelete(row.original.id);
                  }}
                  className="flex gap-2 w-full text-left"
                >
                  <Trash className="w-4 h-4" />
                  Delete KPI
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return <Skeleton />;
  }

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <h2 className="font-semibold text-xl">KPI List</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Search KPI"
                icon={<Search className="size-5 text-grayscale-20" />}
                iconPosition="right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button onClick={() => handleNew()} className="whitespace-nowrap">
                + New KPI
              </Button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={data || []}
            customSize={!isMobile}
            apiPagination={pagination}
            paginationState={paginationState}
            setPaginationState={setPagination}
          />
        </div>
      </div>
      <FormModal
        open={openForm}
        onOpenChange={handleCloseForm}
        jobPositionOptions={jobPositionOptions}
        jobLevelOptions={jobLevelOptions}
        frequencyOptions={frequencyOptions}
        formatOptions={formatOptions}
        aggregationOptions={aggregationOptions}
        directionOptions={directionOptions}
        onSave={handleSave}
        kpiDetails={kpiDetails}
        editMode={!!editKpiId}
        isLoadingDetails={isLoadingDetails}
      />
      <DetailModal
        open={openDetail}
        onOpenChange={handleCloseDetail}
        data={kpiDetailData}
      />
      <DeleteModal
        open={openDelete}
        onOpenChange={handleCloseDelete}
        onSave={handleConfirmDelete}
        id={deleteKpiId || 0}
      />
    </div>
  );
}
