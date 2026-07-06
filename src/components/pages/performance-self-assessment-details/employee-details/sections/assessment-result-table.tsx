import DataTable from "@/components/tables/data-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import {
  IAssessmentData,
  IAssessmentGroup,
} from "@/services/employees/self-assessment/types";
import {
  ASSESSMENT_RESULT_HELPER_TEXT,
  formatCategoryRating,
  formatTotalScore,
  formatWeightedContribution,
  formatWeightedContributionHint,
} from "./score-display";

interface AssessmentResultTableProps {
  data?: IAssessmentData;
  scoreHeaderClassName?: string;
}

const columns: ColumnDef<IAssessmentGroup>[] = [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => (
      <div className="font-normal text-gray-900">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "rating_score",
    header: "Category Rating",
    cell: ({ row }) => (
      <div className="text-gray-900 font-medium">
        {formatCategoryRating(row.original)}
      </div>
    ),
  },
  {
    accessorKey: "score",
    header: "Weighted Contribution",
    cell: ({ row }) => {
      const hint = formatWeightedContributionHint(row.original);

      return (
        <div className="text-gray-900">
          <div>{formatWeightedContribution(row.original)}</div>
          {hint ? (
            <div className="text-xs text-text-secondary mt-0.5">{hint}</div>
          ) : null}
        </div>
      );
    },
  },
];

export const AssessmentResultTable = ({
  data,
  scoreHeaderClassName,
}: AssessmentResultTableProps) => {
  const resolvedColumns = React.useMemo(() => {
    if (!scoreHeaderClassName) {
      return columns;
    }

    return columns.map((column) => {
      if (column.accessorKey === "rating_score" || column.accessorKey === "score") {
        return {
          ...column,
          header: () => (
            <div className={scoreHeaderClassName}>
              {column.accessorKey === "rating_score"
                ? "Category Rating"
                : "Weighted Contribution"}
            </div>
          ),
        };
      }

      return column;
    });
  }, [scoreHeaderClassName]);

  return (
    <>
      <p className="text-sm text-text-secondary">
        {ASSESSMENT_RESULT_HELPER_TEXT}
      </p>
      <DataTable
        columns={resolvedColumns}
        data={data?.groups || []}
        tableFooter={
          <TableRow className="bg-primary-background py-4 px-6">
            <TableCell
              colSpan={2}
              className="text-right text-text-secondary font-semibold"
            >
              Total Score
            </TableCell>
            <TableCell className="font-semibold text-primary">
              {formatTotalScore(data)}
            </TableCell>
          </TableRow>
        }
      />
    </>
  );
};
