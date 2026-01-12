import * as React from "react";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { getPenalties } from "@/services/employees/penalties";
import { IPenaltyResponse } from "@/services/employees/penalties/hook";

interface PenaltyDetailProps {
  userId: number;
}

export const PenaltyDetail = React.memo(function PenaltyDetail({
  userId,
}: PenaltyDetailProps) {
  const { data: penaltiesData, isLoading } = useQuery({
    queryKey: ["employee-penalties", userId],
    queryFn: () => getPenalties(userId),
    enabled: !!userId,
  });

  const penalties = penaltiesData?.data?.data ?? [];

  const columns: ColumnDef<IPenaltyResponse>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.original.id ?? "-",
    },
    {
      accessorKey: "user_id",
      header: "User ID",
      cell: ({ row }) => row.original.user_id ?? "-",
    },
    {
      accessorKey: "point",
      header: "Point",
      cell: ({ row }) => row.original.point ?? "-",
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name ?? "-",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description ?? "-",
    },
    {
      accessorKey: "valid_until",
      header: "Valid Until",
      cell: ({ row }) => {
        const validUntil = row.original.valid_until;
        if (!validUntil) return "-";
        const { date } = formatDateTime(validUntil);
        return date;
      },
    },
    {
      accessorKey: "author_id",
      header: "Author ID",
      cell: ({ row }) => row.original.author_id ?? "-",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const createdAt = row.original.created_at;
        if (!createdAt) return "-";
        const { date, hour } = formatDateTime(createdAt);
        return `${date} ${hour}`;
      },
    },
    {
      accessorKey: "updated_at",
      header: "Updated At",
      cell: ({ row }) => {
        const updatedAt = row.original.updated_at;
        if (!updatedAt) return "-";
        const { date, hour } = formatDateTime(updatedAt);
        return `${date} ${hour}`;
      },
    },
  ];

  return (
    <div className="flex flex-col w-full gap-4 p-2">
      <h2 className="font-semibold text-xl">Penalties</h2>
      <DataTable columns={columns} data={penalties} maxBodyHeight={500} />
    </div>
  );
});
