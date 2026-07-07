import DataTable from "@/components/tables/data-table";
import { TableCell, TableRow } from "@/components/ui/table";
import { getFormById } from "@/services/form";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import * as React from "react";
import {
  IAssessmentData,
  IAssessmentGroup,
} from "@/services/employees/self-assessment/types";
import {
  ASSESSMENT_RESULT_HELPER_TEXT,
  buildCategoryRatingTooltip,
  buildTotalScoreTooltip,
  buildWeightedContributionTooltip,
  CATEGORY_RATING_COLUMN_TOOLTIP,
  formatCategoryRating,
  formatTotalScore,
  formatWeightedContribution,
  formatWeightedContributionHint,
  indexFormFieldsById,
  TOTAL_SCORE_TOOLTIP_LABEL,
  WEIGHTED_CONTRIBUTION_COLUMN_TOOLTIP,
} from "./score-display";
import { ScoreInfoTooltip, ScoreWithInfo } from "./score-info-tooltip";

interface AssessmentResultTableProps {
  data?: IAssessmentData;
  formId?: number;
  scoreHeaderClassName?: string;
}

function ColumnHeaderWithInfo({
  title,
  tooltip,
}: {
  title: string;
  tooltip: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span>{title}</span>
      <ScoreInfoTooltip content={tooltip} label={`About ${title}`} />
    </div>
  );
}

export const AssessmentResultTable = ({
  data,
  formId,
  scoreHeaderClassName,
}: AssessmentResultTableProps) => {
  const { data: formResponse } = useQuery({
    queryKey: ["form", formId],
    queryFn: () => getFormById(formId!),
    enabled: !!formId,
  });

  const formFieldsById = React.useMemo(
    () => indexFormFieldsById(formResponse?.data?.groups),
    [formResponse?.data?.groups],
  );

  const columns = React.useMemo((): ColumnDef<IAssessmentGroup>[] => {
    return [
      {
        accessorKey: "name",
        header: "Category",
        cell: ({ row }) => (
          <div className="font-normal text-gray-900">{row.original.name}</div>
        ),
      },
      {
        accessorKey: "rating_score",
        header: () => (
          <ColumnHeaderWithInfo
            title="Category Rating"
            tooltip={CATEGORY_RATING_COLUMN_TOOLTIP}
          />
        ),
        cell: ({ row }) => (
          <ScoreWithInfo
            className="text-gray-900 font-medium"
            value={formatCategoryRating(row.original)}
            tooltip={buildCategoryRatingTooltip(
              row.original,
              data?.fields,
              formFieldsById,
            )}
            tooltipLabel={`How ${row.original.name} category rating is calculated`}
          />
        ),
      },
      {
        accessorKey: "score",
        header: () => (
          <ColumnHeaderWithInfo
            title="Weighted Contribution"
            tooltip={WEIGHTED_CONTRIBUTION_COLUMN_TOOLTIP}
          />
        ),
        cell: ({ row }) => {
          const hint = formatWeightedContributionHint(row.original);

          return (
            <div className="text-gray-900">
              <ScoreWithInfo
                value={formatWeightedContribution(row.original)}
                tooltip={buildWeightedContributionTooltip(row.original)}
                tooltipLabel={`How ${row.original.name} weighted contribution is calculated`}
              />
              {hint ? (
                <div className="text-xs text-text-secondary mt-0.5">{hint}</div>
              ) : null}
            </div>
          );
        },
      },
    ];
  }, [data?.fields, formFieldsById]);

  const resolvedColumns = React.useMemo((): ColumnDef<IAssessmentGroup>[] => {
    if (!scoreHeaderClassName) {
      return columns;
    }

    return columns.map((column) => {
      const accessorKey =
        "accessorKey" in column ? String(column.accessorKey) : "";
      if (accessorKey === "rating_score" || accessorKey === "score") {
        const title =
          accessorKey === "rating_score"
            ? "Category Rating"
            : "Weighted Contribution";
        const tooltip =
          accessorKey === "rating_score"
            ? CATEGORY_RATING_COLUMN_TOOLTIP
            : WEIGHTED_CONTRIBUTION_COLUMN_TOOLTIP;

        return {
          ...column,
          id: accessorKey,
          header: () => (
            <div className={scoreHeaderClassName}>
              <ColumnHeaderWithInfo title={title} tooltip={tooltip} />
            </div>
          ),
        } as ColumnDef<IAssessmentGroup>;
      }

      return column;
    });
  }, [columns, scoreHeaderClassName]);

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
              <ScoreWithInfo
                value={formatTotalScore(data)}
                tooltip={buildTotalScoreTooltip(data)}
                tooltipLabel={TOTAL_SCORE_TOOLTIP_LABEL}
              />
            </TableCell>
          </TableRow>
        }
      />
    </>
  );
};
