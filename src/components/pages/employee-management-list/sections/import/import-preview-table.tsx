/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IPaginatedErrors } from "@/services/employees/import-service";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ImportPreviewTableProps {
  paginatedErrors: IPaginatedErrors;
  onPageChange: (page: number) => void;
}

export function ImportPreviewTable({ paginatedErrors, onPageChange }: ImportPreviewTableProps) {
  const errors = paginatedErrors?.data || [];
  const current_page = paginatedErrors?.current_page || 1;
  const last_page = paginatedErrors?.last_page || 1;

  if (errors.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-grayscale-90">
        No errors found in the import file.
      </div>
    );
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (current_page > 1) onPageChange(current_page - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (current_page < last_page) onPageChange(current_page + 1);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader className="bg-grayscale-10">
          <TableRow>
            <TableHead className="font-semibold text-grayscale-90 whitespace-nowrap w-[100px]">Row</TableHead>
            <TableHead className="font-semibold text-grayscale-90 whitespace-nowrap">Error Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {errors.map((error, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium text-grayscale-90">{error.row ?? "-"}</TableCell>
              <TableCell className="text-error font-medium">{error.message || "Unknown error"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {last_page > 1 && (
        <Pagination className="justify-center py-4 border-t border-grayscale-20">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={handlePrevious}
                className={current_page <= 1 ? "pointer-events-none opacity-50" : ""}
                aria-disabled={current_page <= 1}
                tabIndex={current_page <= 1 ? -1 : 0}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{current_page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={handleNext}
                className={current_page >= last_page ? "pointer-events-none opacity-50" : ""}
                aria-disabled={current_page >= last_page}
                tabIndex={current_page >= last_page ? -1 : 0}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
