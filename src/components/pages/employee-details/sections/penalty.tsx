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
import { Badge } from "@/components/ui/badge";
import { rupiahFormatter } from "@/lib/helpers";
import {
  formatPeriod,
  getConditionLabel,
  getTriggerLabel,
  getAppliedAmount,
} from "./penalty-utils";

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
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 max-w-[260px]">
          <span className="font-medium text-grayscale-90">
            {row.original.name ?? "-"}
          </span>
          {row.original.description ? (
            <span className="text-xs text-grayscale-50 line-clamp-2">
              {row.original.description}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "trigger_type",
      header: "Trigger",
      cell: ({ row }) => {
        const trigger = row.original.meta?.trigger_type;
        if (!trigger) return "-";
        return (
          <Badge variant="outline" className="font-normal">
            {getTriggerLabel(trigger)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "condition_type",
      header: "Condition",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal">
          {getConditionLabel(row.original.condition_type)}
        </Badge>
      ),
    },
    {
      accessorKey: "period",
      header: "Period",
      cell: ({ row }) => formatPeriod(row.original.period),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = getAppliedAmount(row.original);
        if (amount === 0) {
          return (
            <Badge
              variant="outline"
              className="border-success text-success font-normal"
            >
              Tanpa Potongan
            </Badge>
          );
        }
        return (
          <span className="font-medium text-error">
            {rupiahFormatter(amount)}
          </span>
        );
      },
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
