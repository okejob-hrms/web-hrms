import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, Eye } from "lucide-react";
import dayjs from "dayjs";
import useOKR from "./hook";
import FormModal from "./sections/form-modal";
import { getStatusOKRCycle } from "@/lib/helpers";
import { Badge } from "@/components/ui/badge";
import { IOKRResponse } from "@/services/okr/types";
import { cn } from "@/lib/utils";

export default function PerformanceOKR() {
  const {
    data,
    pagination,
    paginationState,
    setPagination,
    openForm,
    handleNew,
    handleDetail,
    handleSave,
    handleCloseForm,
    periodOptions,
  } = useOKR();

  const isMobile = useIsMobile();

  const columns: ColumnDef<IOKRResponse>[] = [
    {
      accessorKey: "period",
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
            <span>Period</span>
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
      cell: ({ row }) => (
        <span>
          {row.original.period} {row.original.period_year}
        </span>
      ),
    },
    {
      accessorKey: "start_date",
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
            <span>Start Date</span>
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
      cell: ({ row }) => (
        <span>{dayjs(row.original.start_date).format("LL")}</span>
      ),
    },
    {
      accessorKey: "end_date",
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
            <span>End Date</span>
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
      cell: ({ row }) => (
        <span>{dayjs(row.original.end_date).format("LL")}</span>
      ),
    },
    {
      accessorKey: "total",
      header: "Total OKR",
      cell: ({ row }) => {
        return <span>{row.original.objectives_count}</span>;
      },
    },
    {
      accessorKey: "overall_progress",
      header: "Overall Achievement",
      cell: ({ row }) => {
        return <span>{Number(row.original.overall_progress).toFixed(2)}%</span>;
      },
    },
    {
      accessorKey: "status",
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
            <span>Status</span>
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
        const status = row.original.status_label;
        const { variant, className, label, circleClassName } =
          getStatusOKRCycle(status);
        if (!row.original.status_label) return "-";

        return (
          <Badge variant={variant} className={className}>
            <div className={cn(circleClassName, "w-2 h-2 rounded-full")} />{" "}
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "updated_at",
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
      cell: ({ row }) => (
        <span>{dayjs(row.original.updated_at).format("LL")}</span>
      ),
    },
    {
      maxSize: 70,
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          onClick={() => handleDetail(row.original.id)}
          className="whitespace-nowrap"
        >
          <Eye />
        </Button>
      ),
      // cell: ({ row }) => (
      // 	<DropdownMenu>
      // 		<DropdownMenuTrigger asChild>
      // 			<button className="p-1 hover:bg-gray-100 rounded">
      // 				<Ellipsis className="text-grayscale-30" />
      // 			</button>
      // 		</DropdownMenuTrigger>
      // 		<DropdownMenuContent>
      // 			<DropdownMenuContent>
      // 				<DropdownMenuItem asChild>
      // 					<button
      // 						onClick={() => {
      // 							handleDetail(row.original);
      // 						}}
      // 						className="flex gap-2 w-full text-left"
      // 					>
      // 						<Eye className="w-4 h-4" />
      // 						KPI Details
      // 					</button>
      // 				</DropdownMenuItem>
      // 				<DropdownMenuItem asChild>
      // 					<button
      // 						onClick={() => {
      // 							handleEdit(row.original.id);
      // 						}}
      // 						className="flex gap-2 w-full text-left"
      // 					>
      // 						<Edit2 className="w-4 h-4" />
      // 						Edit KPI
      // 					</button>
      // 				</DropdownMenuItem>
      // 				<DropdownMenuItem asChild>
      // 					<button
      // 						onClick={() => {
      // 							handleDelete(row.original.id);
      // 						}}
      // 						className="flex gap-2 w-full text-left"
      // 					>
      // 						<Trash className="w-4 h-4" />
      // 						Delete KPI
      // 					</button>
      // 				</DropdownMenuItem>
      // 			</DropdownMenuContent>
      // 		</DropdownMenuContent>
      // 	</DropdownMenu>
      // ),
    },
  ];

  // if (isLoading) {
  // 	return <Skeleton />;
  // }

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <h2 className="font-semibold text-xl">
              Objective & Key Results (OKR)
            </h2>
            <Button onClick={() => handleNew()} className="whitespace-nowrap">
              + New OKR Cycle
            </Button>
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
        periodOptions={periodOptions}
        onSave={handleSave}
        editMode={false}
      />
      {/* 
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
			/> */}
    </div>
  );
}
