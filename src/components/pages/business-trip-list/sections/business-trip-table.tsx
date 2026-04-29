"use client";

import * as React from "react";
import dayjs from "dayjs";
import { ColumnDef } from "@tanstack/react-table";
import { PaginationState } from "@tanstack/react-table";

import { DataTable } from "@/components/tables/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  formatDateRange,
  formatDayDifference,
  getStatusBusinessTrip,
} from "@/lib/helpers";
import { stringAvatar } from "@/lib/utils";
import { ApiPagination } from "@/lib/types";
import { IBusinessTripResponse } from "@/services/business-trips/types";

interface Props {
  data: IBusinessTripResponse[];
  apiPagination?: ApiPagination;
  paginationState: PaginationState;
  setPaginationState: React.Dispatch<React.SetStateAction<PaginationState>>;
  loading?: boolean;
}

export default function BusinessTripTable({
  data,
  apiPagination,
  paginationState,
  setPaginationState,
  loading,
}: Props) {
  const columns: ColumnDef<IBusinessTripResponse>[] = React.useMemo(
    () => [
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
    ],
    [],
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
