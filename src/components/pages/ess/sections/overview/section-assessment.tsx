"use client";

import SelfAssessmentList from "@/components/pages/performance-self-assessment";
import { getEmployeeSelfAssessments } from "@/services/employees/self-assessment";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/tables/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { IEmployeeSelfAssessmentResponse } from "@/services/employees/self-assessment/types";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const getStatusBadgeVariant = (status: string | null | undefined) => {
  if (!status) return "secondary";
  const lowerStatus = status.toLowerCase();
  if (
    lowerStatus.includes("completed") ||
    lowerStatus.includes("approved") ||
    lowerStatus.includes("done")
  ) {
    return "default";
  }
  if (
    lowerStatus.includes("pending") ||
    lowerStatus.includes("in progress") ||
    lowerStatus.includes("draft")
  ) {
    return "outline";
  }
  if (
    lowerStatus.includes("rejected") ||
    lowerStatus.includes("overdue") ||
    lowerStatus.includes("expired")
  ) {
    return "destructive";
  }
  return "secondary";
};

export const SectionAssessment = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleViewAssessment = (id: number, formId: number) => {
    queryClient.invalidateQueries({ queryKey: ["form-detail", formId] });
    queryClient.invalidateQueries({ queryKey: ["assessment-detail", id] });
    router.push(`/ess/assessment/${id}?formId=${formId}`);
  };

  const columns: ColumnDef<IEmployeeSelfAssessmentResponse>[] = [
    {
      accessorKey: "period",
      header: "Period",
      // size: 300,
      cell: ({ row }) => row.original.period ?? "-",
    },
    {
      accessorKey: "span-1",
      header: "",
    },
    {
      accessorKey: "span-2",
      header: "",
    },
    {
      accessorKey: "span-3",
      header: "",
    },
    {
      accessorKey: "span-4",
      header: "",
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) =>
        dayjs(row.original.due_date).format("LL") ?? "-",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>{status ?? "-"}</Badge>
        );
      },
    },
    {
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => (
        <div
          onClick={() =>
            handleViewAssessment(row.original.id, row.original.form_id)
          }
          className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer flex items-center justify-center w-fit"
        >
          <Eye className="w-4 h-4 text-gray-500" />
        </div>
      ),
    },
  ];
  const { data: selfAssessments, isLoading } = useQuery({
    queryKey: ["employee-self-assessment"],
    queryFn: () => getEmployeeSelfAssessments(),
  });
  return (
    <div className="font-sans min-h-screen flex flex-col w-full gap-2 px-8 py-6">
      <DataTable columns={columns} data={selfAssessments?.data || []} />
    </div>
  );
};
