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
  const getRowClasses = (bgColor?: string) => {
    switch (bgColor) {
      case "yellow":
        return "bg-yellow-50 hover:bg-yellow-50";
      case "blue":
        return "bg-blue-50 hover:bg-blue-50";
      default:
        return "hover:bg-gray-50";
    }
  };

  const getScoreClasses = (textColor?: string) => {
    switch (textColor) {
      case "red":
        return "text-red-500 font-semibold";
      case "blue":
        return "text-blue-600 font-semibold";
      default:
        return "text-gray-900 font-semibold";
    }
  };

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
          {data.map((row) => (
            <TableRow
              key={row.id}
              className={`border-t border-grayscale-20 py-6 ${getRowClasses(row.bgColor)}`}
            >
              <TableCell className="text-text-secondary text-sm">
                {row.category}
              </TableCell>
              <TableCell
                className={`text-right py-4 ${getScoreClasses(row.textColor)}`}
              >
                {row.maxScore
                  ? `${row.score.toFixed(2)}/${row.maxScore.toFixed(2)}`
                  : row.score}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-gray-50">
            <TableCell className="text-right">Total Score</TableCell>
            <TableCell className="text-right">
              <span className="text-primary font-semibold">4.65</span>
              <span className="text-text-secondary font-normal">/5.00</span>
            </TableCell>
          </TableRow>
          <TableRow className="bg-warning-background">
            <TableCell className="text-right">Penalty Point</TableCell>
            <TableCell className="text-right">
              <span className="text-error font-semibold">-10</span>
            </TableCell>
          </TableRow>
          <TableRow className="bg-primary-background">
            <TableCell className="text-right">Nilai Kinerja</TableCell>
            <TableCell className="text-right">
              <span className="text-primary font-semibold">84.60</span>
            </TableCell>
          </TableRow>
          <TableRow className="bg-primary-background">
            <TableCell className="text-right">Tingkat Kinerja</TableCell>
            <TableCell className="text-right">
              <span className="text-primary font-semibold">B</span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};
