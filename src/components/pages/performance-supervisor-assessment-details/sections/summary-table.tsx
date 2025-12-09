"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssessmentSummaryTableProps } from "../types";

export const AssessmentSummaryTable: React.FC<AssessmentSummaryTableProps> = ({
  data,
}) => {
  const scoreThreshold = data.score_threshold?.score || "-";

  return (
    <div className="w-full border border-grayscale-20 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="text-text-secondary text-xs">
              Category
            </TableHead>
            <TableHead className="text-right text-text-secondary text-xs">
              Score
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.groups.map((row) => (
            <TableRow
              key={row.field_group_id}
              className={`border-t border-grayscale-20 py-6`}
            >
              <TableCell className="text-text-secondary text-sm">
                {row.name} ({row.metadata?.score_weight || 0}
                {row.metadata?.score_weight_type === "percent" && "%"})
              </TableCell>
              <TableCell className={`text-right py-4`}>
                {row.score_label}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-gray-50">
            <TableCell className="text-right">
              {data.total_score_label}
            </TableCell>
            <TableCell className="text-right">
              <span className="text-primary font-semibold">
                {data.total_score_label || 0}
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="bg-warning-background">
            <TableCell className="text-right">Penalty Point</TableCell>
            <TableCell className="text-right">
              <span className="text-error font-semibold">0</span>
            </TableCell>
          </TableRow>
          <TableRow className="bg-primary-background">
            <TableCell className="text-right">Nilai Kinerja</TableCell>
            <TableCell className="text-right">
              <span className="text-primary font-semibold">
                {data.work_value_label || 0}
              </span>
            </TableCell>
          </TableRow>
          <TableRow className="bg-primary-background">
            <TableCell className="text-right">Tingkat Kinerja</TableCell>
            <TableCell className="text-right">
              <span className="text-primary font-semibold">
                {scoreThreshold}
              </span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
