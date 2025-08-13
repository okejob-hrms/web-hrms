import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
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

interface DataTableProps<TData, TValue = unknown> {
  columns: (ColumnDef<TData, TValue> & {
    size?: string | number; // allow optional size
  })[];
  data: TData[];
  tableClassName?: string;
  tableHeadClassName?: string;
  tableCellClassName?: string;
  withPagination?: boolean;
  customSize?: boolean;
}

export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  tableClassName,
  tableHeadClassName,
  tableCellClassName,
  withPagination,
  customSize = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full">
      <div className="rounded-md border border-grayscale-20 overflow-hidden">
        {/* Horizontal scroll container */}
        <div className="overflow-x-auto">
          <Table className={cn("w-full min-w-[800px]", tableClassName)}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const columnSize =
                      customSize && header.column.columnDef.size
                        ? header.column.columnDef.size
                        : "120px"; // default min width

                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "bg-gray-50 p-4 sticky top-0 z-10 text-left font-medium",
                          tableHeadClassName,
                        )}
                        style={{ minWidth: columnSize }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50/50">
                    {row.getVisibleCells().map((cell) => {
                      const columnSize =
                        customSize && cell.column.columnDef.size
                          ? cell.column.columnDef.size
                          : "120px"; // default min width

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            "p-4 text-sm",
                            customSize ? "break-words" : "", // only break when customSize
                            tableCellClassName,
                          )}
                          style={{ minWidth: columnSize }}
                        >
                          <div className="max-w-[200px]">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
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
                      There&apos;s currently no data to display in this table.
                      Please add new entries.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {withPagination && <GeneralPagination />}
    </div>
  );
}

export default DataTable;
