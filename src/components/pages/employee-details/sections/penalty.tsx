import * as React from "react";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { getPenalties } from "@/services/employees/penalties";
import { IPenaltyResponse } from "@/services/employees/penalties/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "lucide-react";
import Image from "next/image";
import { AddPenaltyModal } from "./add-penalty-modal";
import { PenaltyDetailModal } from "./penalty-detail-modal";
import { EditPenaltyModal } from "./edit-penalty-modal";
import { DeletePenaltyAlert } from "./delete-penalty-alert";
import { useQueryClient } from "@tanstack/react-query";

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

  const penalties = penaltiesData?.data ?? [];

  const queryClient = useQueryClient();
  const [selectedPenaltyId, setSelectedPenaltyId] = React.useState<
    number | null
  >(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const columns: ColumnDef<IPenaltyResponse>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.original.id ?? "-",
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
      accessorKey: "point",
      header: "Point",
      cell: ({ row }) => row.original.point ?? "-",
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
    {
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Ellipsis className="text-grayscale-30" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => {
                setSelectedPenaltyId(row.original.id);
                setDetailOpen(true);
              }}
            >
              <Image
                src="/icons/eyeVisibleGrey.svg"
                height={16}
                width={16}
                alt="icon-eye"
              />
              Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedPenaltyId(row.original.id);
                setEditOpen(true);
              }}
            >
              <Image
                src="/icons/editGrey.svg"
                height={16}
                width={16}
                alt="icon-edit"
              />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedPenaltyId(row.original.id);
                setDeleteOpen(true);
              }}
            >
              <Image
                src="/icons/delete.svg"
                height={16}
                width={16}
                alt="icon-edit"
              />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full gap-4 p-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">Penalties</h2>
        <AddPenaltyModal userId={userId} />
      </div>
      <DataTable columns={columns} data={penalties} maxBodyHeight={500} />

      <PenaltyDetailModal
        penaltyId={selectedPenaltyId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <EditPenaltyModal
        penaltyId={selectedPenaltyId}
        userId={userId}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeletePenaltyAlert
        penaltyId={selectedPenaltyId}
        userId={userId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
});
