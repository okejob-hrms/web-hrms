"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { resolveLocale } from "@/lib/i18n/locale";
import dayjs from "dayjs";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Ellipsis, Eye, XCircle } from "lucide-react";

import { DataTable } from "@/components/tables/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  formatDateRange,
  formatDayDifference,
  getStatusBusinessTrip,
} from "@/lib/helpers";
import { ApiPagination } from "@/lib/types";
import { IBusinessTripResponse } from "@/services/business-trips/types";

import { EssBusinessTripModalKey } from "../hook";

interface Props {
  data: IBusinessTripResponse[];
  apiPagination?: ApiPagination;
  paginationState: PaginationState;
  setPaginationState: React.Dispatch<React.SetStateAction<PaginationState>>;
  loading?: boolean;
  onSelectTrip: (trip: IBusinessTripResponse) => void;
  onOpenModal: (modal: EssBusinessTripModalKey) => void;
}

export default function EssBusinessTripTable({
  data,
  apiPagination,
  paginationState,
  setPaginationState,
  loading,
  onSelectTrip,
  onOpenModal,
}: Props) {
  const locale = resolveLocale(useLocale());
  const columns: ColumnDef<IBusinessTripResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Trip ID",
        size: 120,
        cell: ({ row }) => (
          <span className="font-medium">#{row.original.id}</span>
        ),
      },
      {
        accessorKey: "duration",
        header: "Duration",
        size: 260,
        cell: ({ row }) => {
          const trip = row.original;
          if (!trip?.start_date || !trip?.end_date) return "-";
          return (
            <div className="flex flex-col">
              <span>{formatDayDifference(trip.start_date, trip.end_date, locale)}</span>
              <span className="text-primary">
                {formatDateRange(trip.start_date, trip.end_date, locale)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "destination",
        header: "Destination",
        size: 200,
        cell: ({ row }) => row.original.destination || "-",
      },
      {
        accessorKey: "reason",
        header: "Reason",
        size: 240,
        cell: ({ row }) => (
          <span className="line-clamp-2">{row.original.reason || "-"}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 140,
        cell: ({ row }) => {
          const { variant, className, key } = getStatusBusinessTrip(
            row.original.status,
          );
          return (
            <StatusBadge statusKey={key} variant={variant} className={className} />
          );
        },
      },
      {
        accessorKey: "updated_at",
        header: "Last Update",
        size: 180,
        cell: ({ row }) =>
          row.original.updated_at ? (
            <div className="flex flex-col">
              <span>
                {dayjs(row.original.updated_at).format("MMMM D, YYYY")}
              </span>
              <span className="text-sm text-text-disabled">
                {dayjs(row.original.updated_at).format("HH:mm")}
              </span>
            </div>
          ) : (
            "-"
          ),
      },
      {
        accessorKey: "menu",
        header: "",
        size: 60,
        cell: ({ row }) => {
          const trip = row.original;
          const isWaiting = trip.status === 0;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Ellipsis className="text-grayscale-30" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => {
                      onSelectTrip(trip);
                      setTimeout(() => onOpenModal("detail"), 0);
                    }}
                    className="flex gap-2 w-full text-left"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </DropdownMenuItem>

                {isWaiting && (
                  <DropdownMenuItem asChild>
                    <button
                      onClick={() => {
                        onSelectTrip(trip);
                        setTimeout(() => onOpenModal("cancel"), 0);
                      }}
                      className="flex gap-2 w-full text-left text-red-600"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                      Cancel Request
                    </button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [onSelectTrip, onOpenModal],
  );

  return (
    <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
      <DataTable
        columns={columns}
        data={data}
        apiPagination={apiPagination}
        paginationState={paginationState}
        setPaginationState={setPaginationState}
        loading={loading}
      />
    </div>
  );
}
