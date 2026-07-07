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
import { IPaginatedRecords } from "@/services/employees/import-service";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useTranslations } from "next-intl";

interface ImportPreviewTableProps {
  paginatedRecords: IPaginatedRecords;
  onPageChange: (page: number) => void;
}

const isInvalidCell = (key: string, errorField: string | null) => {
  if (!errorField || errorField.trim() === "") return false;
  if (key === errorField) return true;
  return false;
};

const formatColumnName = (key: string) => {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function ImportPreviewTable({ paginatedRecords, onPageChange }: ImportPreviewTableProps) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const records = paginatedRecords?.data || [];
  const current_page = paginatedRecords?.current_page || 1;
  const last_page = paginatedRecords?.last_page || 1;

  if (records.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-grayscale-90">
        {t("noImportRecords")}
      </div>
    );
  }

  const dataColumns = records.length > 0 && records[0].data 
    ? Object.keys(records[0].data) 
    : [];

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
      <div className="overflow-x-auto w-full">
        <Table>
          <TableHeader className="bg-grayscale-10">
            <TableRow>
              <TableHead className="font-semibold text-grayscale-90 whitespace-nowrap min-w-[80px]">{tCommon("row")}</TableHead>
              <TableHead className="font-semibold text-grayscale-90 whitespace-nowrap min-w-[100px]">{t("importStatus")}</TableHead>
              {dataColumns.map(col => (
                <TableHead key={col} className="font-semibold text-grayscale-90 whitespace-nowrap">
                  {formatColumnName(col)}
                </TableHead>
              ))}
              <TableHead className="font-semibold text-grayscale-90 whitespace-nowrap min-w-[250px]">Error Message</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record, index) => {
              const isFailed = record.status === 'failed' || !!record.error;
              
              return (
                <TableRow key={index} className={isFailed ? "bg-red-50/20" : ""}>
                  <TableCell className="font-medium text-grayscale-90">{record.row ?? "-"}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${isFailed ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                       {isFailed ? 'Failed' : 'Success'}
                     </span>
                  </TableCell>
                  
                  {dataColumns.map(col => {
                    const value = record.data ? record.data[col] : null;
                    const invalid = isFailed && isInvalidCell(col, record.field);
                    
                    return (
                      <TableCell 
                        key={col} 
                        className={`whitespace-nowrap ${invalid ? 'bg-red-100 text-red-700 border border-red-200 font-medium rounded-md px-3 py-1 m-1 inline-block' : ''}`}
                      >
                        {value !== null && value !== undefined ? String(value) : "-"}
                      </TableCell>
                    );
                  })}
                  
                  <TableCell className="text-error font-medium whitespace-nowrap">
                    {record.error || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {last_page > 1 && (
        <Pagination className="justify-center py-4 border-t border-grayscale-20">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                label={tCommon("previous")}
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
                label={tCommon("next")}
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
