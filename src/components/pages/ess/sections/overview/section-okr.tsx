"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Eye, Loader2 } from "lucide-react";
import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { getStatusOKRCycle } from "@/lib/helpers";
import { useIsMobile } from "@/hooks/use-mobile";
import { getEssOkrCycles } from "@/services/ess/okr";
import { IOKRResponse } from "@/services/okr/types";

export const SectionOkr = () => {
  const router = useRouter();
  const t = useTranslations("performance");
  const tEss = useTranslations("ess");
  const tCommon = useTranslations("common");
  const isMobile = useIsMobile();
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["ess-okr-cycles", pagination],
    queryFn: () =>
      getEssOkrCycles({
        page: pagination.pageIndex + 1,
        per_page: pagination.pageSize,
      }),
  });

  const columns: ColumnDef<IOKRResponse>[] = React.useMemo(
    () => [
      {
        accessorKey: "period",
        header: t("period"),
        cell: ({ row }) => (
          <span>
            {row.original.period} {row.original.period_year}
          </span>
        ),
      },
      {
        accessorKey: "start_date",
        header: t("startDate"),
        cell: ({ row }) =>
          row.original.start_date
            ? dayjs(row.original.start_date).format("LL")
            : "-",
      },
      {
        accessorKey: "end_date",
        header: t("endDate"),
        cell: ({ row }) =>
          row.original.end_date
            ? dayjs(row.original.end_date).format("LL")
            : "-",
      },
      {
        accessorKey: "status_label",
        header: tCommon("status"),
        cell: ({ row }) => {
          if (!row.original.status_label) return "-";
          const { variant, className, key, circleClassName } =
            getStatusOKRCycle(row.original.status_label);
          return (
            <StatusBadge
              statusKey={key}
              variant={variant}
              className={className}
              circleClassName={circleClassName}
            />
          );
        },
      },
      {
        accessorKey: "overall_progress",
        header: t("progress"),
        cell: ({ row }) => row.original.overall_progress ?? "-",
      },
      {
        maxSize: 70,
        accessorKey: "menu",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            onClick={() => router.push(`/ess/okr/${row.original.id}`)}
            className="whitespace-nowrap"
          >
            <Eye />
          </Button>
        ),
      },
    ],
    [router, t, tCommon],
  );

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen flex flex-col py-6 px-6 md:px-12">
      <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
        <h2 className="font-semibold text-xl">{tEss("myOkr")}</h2>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          customSize={!isMobile}
          apiPagination={data?.pagination}
          paginationState={pagination}
          setPaginationState={setPagination}
        />
      </div>
    </div>
  );
};
