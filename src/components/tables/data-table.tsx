"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  RowSelectionState,
  OnChangeFn,
  PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { GeneralPagination } from "../ui/pagination";
import { PaginatedResponse } from "@/lib/types";

interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  tableClassName?: string;
  tableHeadClassName?: string;
  tableCellClassName?: string;
  customSize?: boolean;
  pagination?: PaginatedResponse<TData>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  paginationState?: PaginationState;
  setPaginationState?: React.Dispatch<React.SetStateAction<PaginationState>>;
}

export function DataTable<TData, TValue>({
  columns,
  data = [],
  tableClassName,
  tableHeadClassName,
  tableCellClassName,
  customSize = false,
  pagination,
  rowSelection,
  onRowSelectionChange,
  paginationState,
  setPaginationState,
}: DataTableProps<TData, TValue>) {
  const enableRowSelection = !!rowSelection;
  const isPaginated =
    paginationState !== undefined && setPaginationState !== undefined;

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      ...(isPaginated && { pagination: paginationState }),
    },
    enableRowSelection,
    onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    ...(isPaginated && {
      onPaginationChange: setPaginationState,
      manualPagination: true,
    }),
  });

  return (
    <div className="w-full">
      <div className="rounded-md border border-grayscale-20 overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            className={cn(
              "w-full",
              customSize ? "table-fixed min-w-[800px]" : "min-w-[800px]",
              tableClassName
            )}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={
                        customSize
                          ? {
                              width: header.getSize(),
                              maxWidth: header.getSize(),
                            }
                          : undefined
                      }
                      className={cn(
                        "bg-gray-50 p-4 sticky top-0 z-10 text-left font-medium text-text-secondary",
                        customSize
                          ? "break-words whitespace-normal"
                          : "min-w-[120px]",
                        tableHeadClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-gray-50/50"
                    data-state={
                      enableRowSelection && row.getIsSelected()
                        ? "selected"
                        : undefined
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={
                          customSize
                            ? {
                                width: cell.column.getSize(),
                                maxWidth: cell.column.getSize(),
                              }
                            : undefined
                        }
                        className={cn(
                          "p-4 text-sm",
                          customSize
                            ? "break-words whitespace-normal"
                            : "min-w-[120px]",
                          tableCellClassName
                        )}
                      >
                        {customSize ? (
                          <div className="break-words whitespace-normal">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        ) : (
                          <div className="max-w-[200px] break-words whitespace-break-spaces">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-20 text-center p-4 bg-transparent"
                  >
                    <p className="text-primary font-semibold text-sm">
                      No Data Available
                    </p>
                    <p className="text-text-secondary text-sm">
                      {"There's currently no data to display in this table."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && (
        <GeneralPagination table={table} pagination={pagination} />
      )}
    </div>
  );
}

export default DataTable;
