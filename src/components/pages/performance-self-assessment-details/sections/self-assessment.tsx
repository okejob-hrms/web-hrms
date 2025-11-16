/* eslint-disable @typescript-eslint/no-explicit-any */
import DataTable from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import { Edit } from "lucide-react";
import * as React from "react";
import { AssessmentForm } from "./assessment-form";

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="font-normal text-gray-900">
        {row.original.category || row.original.period}
      </div>
    ),
  },
  {
    accessorKey: "score",
    header: () => <div className="text-center">Score</div>,
    cell: ({ row }) => (
      <div className="text-center text-gray-900">
        {row.original.score || "4"}
        <span className="text-gray-500">/5</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => {
      const status = row.original.status || "Baik";
      return (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            {status}
          </span>
        </div>
      );
    },
  },
];

export const SelfAssessment = () => {
  return (
    <div className="py-4 flex flex-col gap-4">
      <h3 className="font-semibold text-lg text-black">
        Self Assessment Result
      </h3>
      <DataTable
        columns={columns}
        data={[]}
        tableFooter={
          <TableRow className="bg-primary-background py-4 px-6">
            <TableCell className="text-right">Total Score</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
        }
      />
      <div className="flex gap-2 items-center">
        <h3 className="font-semibold text-lg text-black">
          Self Assessment Details
        </h3>
        <Button variant="ghost" className="text-primary font-semibold">
          <Edit /> Edit
        </Button>
      </div>
      <AssessmentForm />
    </div>
  );
};
