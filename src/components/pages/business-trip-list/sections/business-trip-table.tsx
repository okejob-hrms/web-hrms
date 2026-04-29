"use client";

import * as React from "react";
import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { PaginationState } from "@tanstack/react-table";
import { CircleCheckBigIcon, Ellipsis, Eye, XCircle } from "lucide-react";

import { DataTable } from "@/components/tables/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { stringAvatar } from "@/lib/utils";
import { ApiPagination } from "@/lib/types";
import { IBusinessTripResponse } from "@/services/business-trips/types";

import { BusinessTripModalKey } from "../hook";

interface Props {
  data: IBusinessTripResponse[];
  apiPagination?: ApiPagination;
  paginationState: PaginationState;
  setPaginationState: React.Dispatch<React.SetStateAction<PaginationState>>;
  loading?: boolean;
  onSelectTrip: (trip: IBusinessTripResponse) => void;
  onOpenModal: (modal: BusinessTripModalKey) => void;
}

export default function BusinessTripTable({
  data,
  apiPagination,
  paginationState,
  setPaginationState,
  loading,
  onSelectTrip,
  onOpenModal,
}: Props) {
  const columns: ColumnDef<IBusinessTripResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: "Trip ID",
        size: 140,
        cell: ({ row }) => `#${row.original.id}`,
      },
      {
        accessorKey: "user.name",
        header: "Employee",
        cell: ({ row }) => (
          <div className="flex gap-4 items-center min-w-[180px]">
            <Avatar className="h-10 w-10">
              <AvatarImage src={row.original.user?.photo_profile_url ?? ""} />
              <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                {stringAvatar(row.original.user?.name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">
                {row.original.user?.name}
              </span>
              <span className="text-text-secondary text-xs">
                {row.original.user?.employee_code
                  ? `#${row.original.user.employee_code}`
                  : `#${row.original.user?.id ?? "-"}`}
              </span>
            </div>
          </div>
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
            <div className="flex flex-col w-max-2xl">
              <span>{formatDayDifference(trip.start_date, trip.end_date)}</span>
              <span className="text-primary">
                {formatDateRange(trip.start_date, trip.end_date)}
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
        cell: ({ row }) => row.original.reason || "-",
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 140,
        cell: ({ row }) => {
          const { variant, className, label } = getStatusBusinessTrip(
            row.original.status,
          );
          return (
            <Badge variant={variant} className={className}>
              {label}
            </Badge>
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
                    Business Trip Details
                  </button>
                </DropdownMenuItem>

                {isWaiting && (
                  <>
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => {
                          onSelectTrip(trip);
                          setTimeout(() => onOpenModal("approve"), 0);
                        }}
                        className="flex gap-2 w-full text-left"
                      >
                        <CircleCheckBigIcon className="w-4 h-4" />
                        Approve Request
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => {
                          onSelectTrip(trip);
                          setTimeout(() => onOpenModal("reject"), 0);
                        }}
                        className="flex gap-2 w-full text-left text-red-600"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                        Reject Request
                      </button>
                    </DropdownMenuItem>
                  </>
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
      <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
        <h2 className="font-semibold text-xl">Business Trip</h2>
      </div>

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
