/* eslint-disable @typescript-eslint/no-explicit-any */
import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import * as React from "react";
import { AssessmentForm } from "./assessment-form";
import {
  IAssessmentGroup,
  IAssessmentSubmission,
} from "@/services/employees/self-assessment/types";
import { FormProvider, useForm } from "react-hook-form";

interface SelfAssessmentProps {
  data?: IAssessmentSubmission;
}

export const SelfAssessment = ({ data }: SelfAssessmentProps) => {
  const form = useForm({
    defaultValues: {
      fields: data?.data?.fields || [],
    },
  });

  const columns: ColumnDef<IAssessmentGroup>[] = [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => (
        <div className="font-normal text-gray-900">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "score",
      header: "Score",
      cell: ({ row }) => (
        <div className="text-gray-900 w-full">
          {row.original.score || "0"}
          <span className="text-gray-500">
            /{data?.data?.total_score || "0"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="py-4 flex flex-col gap-4">
      <h3 className="font-semibold text-lg text-black">
        Self Assessment Result
      </h3>
      <DataTable
        columns={columns}
        data={data?.data?.groups || []}
        tableFooter={
          <TableRow className="bg-primary-background py-4 px-6">
            <TableCell className="text-right text-text-secondary font-semibold">
              Total Score
            </TableCell>
            <TableCell className="font-semibold text-primary">
              {data?.data?.total_score || "0"}
            </TableCell>
          </TableRow>
        }
      />
      <div className="flex gap-2 items-center">
        <h3 className="font-semibold text-lg text-black">
          Self Assessment Details
        </h3>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(() => {})}>
          <AssessmentForm
            fields={data?.data?.fields}
            groups={data?.data?.groups}
            formId={data?.form_id || 0}
          />
        </form>
      </FormProvider>
    </div>
  );
};
