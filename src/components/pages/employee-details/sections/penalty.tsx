import * as React from "react";
import { DataTable } from "@/components/tables/data-table";
import { ColumnDef, PaginationState } from "@tanstack/react-table";
import { formatDateTime } from "@/lib/helpers";
import { useQuery } from "@tanstack/react-query";
import { getPenalties } from "@/services/employees/penalties";
import {
  IPenaltyResponse,
  PenaltyConditionType,
  PenaltyValidityStatus,
} from "@/services/employees/penalties/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ellipsis, X } from "lucide-react";
import Image from "next/image";
import { AddPenaltyModal } from "./add-penalty-modal";
import { PenaltyDetailModal } from "./penalty-detail-modal";
import { EditPenaltyModal } from "./edit-penalty-modal";
import { DeletePenaltyAlert } from "./delete-penalty-alert";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { rupiahFormatter } from "@/lib/helpers";
import {
  usePenaltyLabels,
} from "./penalty-utils";
import { useTranslations } from "next-intl";

interface PenaltyDetailProps {
  userId: number;
}

interface PenaltyFilters {
  condition_type: PenaltyConditionType | "all";
  period: string;
  valid_status: PenaltyValidityStatus | "all";
}

const DEFAULT_FILTERS: PenaltyFilters = {
  condition_type: "all",
  period: "",
  valid_status: "all",
};

export const PenaltyDetail = React.memo(function PenaltyDetail({
  userId,
}: PenaltyDetailProps) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const {
    getTriggerLabel,
    getConditionLabel,
    formatPeriod,
    getAppliedAmount,
  } = usePenaltyLabels();
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState<PenaltyFilters>(DEFAULT_FILTERS);

  // Any filter change must send the user back to the first page, otherwise
  // they could be stranded on a page that no longer exists in the new result set.
  const updateFilter = React.useCallback(
    <K extends keyof PenaltyFilters>(key: K, value: PenaltyFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    },
    [],
  );

  const hasActiveFilter =
    filters.condition_type !== "all" ||
    filters.period !== "" ||
    filters.valid_status !== "all";

  const resetFilters = React.useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const queryParams = React.useMemo(
    () => ({
      user_id: userId,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      condition_type:
        filters.condition_type === "all" ? undefined : filters.condition_type,
      period: filters.period || undefined,
      valid_status:
        filters.valid_status === "all" ? undefined : filters.valid_status,
    }),
    [userId, pagination, filters],
  );

  const { data: penaltiesData, isLoading } = useQuery({
    queryKey: ["employee-penalties", queryParams],
    queryFn: () => getPenalties(queryParams),
    enabled: !!userId,
  });

  const penalties = penaltiesData?.data ?? [];

  const apiPagination = penaltiesData
    ? {
        current_page: penaltiesData.current_page,
        per_page: penaltiesData.per_page,
        total: penaltiesData.total,
        last_page: penaltiesData.last_page ?? penaltiesData.current_page,
        from: penaltiesData.from ?? 0,
        to: penaltiesData.to ?? 0,
        first: penaltiesData.first_page_url ?? "",
        last: "",
        prev: penaltiesData.prev_page_url ?? null,
        next: penaltiesData.next_page_url ?? null,
      }
    : undefined;

  const queryClient = useQueryClient();
  const [selectedPenaltyId, setSelectedPenaltyId] = React.useState<
    number | null
  >(null);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const columns: ColumnDef<IPenaltyResponse>[] = React.useMemo(
    () => [
    {
      accessorKey: "id",
      header: tCommon("id"),
      cell: ({ row }) => row.original.id ?? "-",
    },
    {
      accessorKey: "name",
      header: tCommon("name"),
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
      header: t("penaltyTrigger"),
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
      header: t("condition"),
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal">
          {getConditionLabel(row.original.condition_type)}
        </Badge>
      ),
    },
    {
      accessorKey: "period",
      header: t("employeePayrollPeriod"),
      cell: ({ row }) => formatPeriod(row.original.period),
    },
    {
      accessorKey: "amount",
      header: t("amount"),
      cell: ({ row }) => {
        const amount = getAppliedAmount(row.original);
        if (amount === 0) {
          return (
            <Badge
              variant="outline"
              className="border-success text-success font-normal"
            >
              {t("noDeduction")}
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
      header: t("validUntil"),
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
              {tCommon("details")}
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
              {tCommon("edit")}
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
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ],
  [t, tCommon, getTriggerLabel, getConditionLabel, formatPeriod, getAppliedAmount],
  );

  return (
    <div className="flex flex-col w-full gap-4 p-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">{t("penaltiesTitle")}</h2>
        <AddPenaltyModal userId={userId} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
        <Select
          value={filters.condition_type}
          onValueChange={(v) =>
            updateFilter("condition_type", v as PenaltyConditionType | "all")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("condition")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allConditions")}</SelectItem>
            <SelectItem value="per_occurrence">{t("perOccurrence")}</SelectItem>
            <SelectItem value="monthly_aggregate">{t("monthlyAggregate")}</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="month"
          value={filters.period}
          onChange={(e) => updateFilter("period", e.target.value)}
          aria-label={t("employeePayrollPeriod")}
        />

        <Select
          value={filters.valid_status}
          onValueChange={(v) =>
            updateFilter("valid_status", v as PenaltyValidityStatus | "all")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("validUntil")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="active">{t("stillValid")}</SelectItem>
            <SelectItem value="expired">{t("expiredStatus")}</SelectItem>
          </SelectContent>
        </Select>
        </div>

        {hasActiveFilter && (
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="flex items-center gap-1 text-text-secondary shrink-0"
          >
            <X className="w-4 h-4" />
            {t("resetFilter")}
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={penalties}
        loading={isLoading}
        apiPagination={apiPagination}
        paginationState={pagination}
        setPaginationState={setPagination}
      />

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
