'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as React from 'react';
import { DataTable } from '@/components/tables/data-table';
import {
  ColumnDef,
  OnChangeFn,
  RowSelectionState,
} from '@tanstack/react-table';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  IEmployee,
  IEmployeePagination,
  IEmployeeModule,
} from '@/services/settings/types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

type AssignEmployeeProps = {
  // terima kedua bentuk: inner pagination atau full module response
  pagination: IEmployeePagination | IEmployeeModule | null;
  rowSelection: RowSelectionState;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
  selectedEmployees: IEmployee[];
  setSelectedEmployees: React.Dispatch<React.SetStateAction<IEmployee[]>>;
};

export default function AssignEmployee({
  pagination,
  rowSelection,
  onRowSelectionChange,
  selectedEmployees,
  setSelectedEmployees,
}: AssignEmployeeProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // --- ambil array employee terlepas dari bentuk pagination yang dikirim
  const employees = React.useMemo<IEmployee[]>(() => {
    if (!pagination) return [];

    // jika pagination adalah API module wrapper: { status, message, data: IEmployeePagination }
    if (typeof pagination === 'object' && 'status' in pagination) {
      const maybeInner = (pagination as IEmployeeModule).data;
      return Array.isArray(maybeInner?.data) ? maybeInner.data : [];
    }

    // jika pagination adalah IEmployeePagination langsung
    const pag = pagination as IEmployeePagination;
    return Array.isArray(pag?.data) ? pag.data : [];
  }, [pagination]);

  // --- untuk mengirim object pagination yang sesuai ke DataTable
  const tablePagination = React.useMemo<IEmployeePagination | undefined>(() => {
    if (!pagination) return undefined;
    if (typeof pagination === 'object' && 'status' in pagination) {
      return (pagination as IEmployeeModule).data;
    }
    return pagination as IEmployeePagination;
  }, [pagination]);

  const columns: ColumnDef<IEmployee>[] = [
    { accessorKey: 'name', header: 'Name', size: 300 },
    { accessorKey: 'job_position', header: 'Position', size: 200 },
    { accessorKey: 'department', header: 'Department', size: 200 },
    { accessorKey: 'job_level', header: 'Job Level', size: 200 },
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <Button
              variant="link"
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
              onClick={() =>
                setSelectedEmployees((prev) =>
                  prev.filter((emp) => emp.id !== item.id),
                )
              }
            >
              <Trash className="w-4 h-4 text-danger" />
            </Button>
          </div>
        );
      },
    },
  ];

  const candidateColumns: ColumnDef<IEmployee>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(val) => row.toggleSelected(!!val)}
          aria-label="Select row"
        />
      ),
      size: 40,
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'name', header: 'Name', size: 250 },
    { accessorKey: 'job_position', header: 'Position', size: 180 },
    { accessorKey: 'department', header: 'Department', size: 180 },
    { accessorKey: 'job_level', header: 'Job Level', size: 180 },
  ];

  // ketika modal dibuka, set initial selection berdasarkan selectedEmployees
  React.useEffect(() => {
    if (open) {
      const initialSelection: RowSelectionState = {};
      employees.forEach((emp, idx) => {
        if (selectedEmployees.some((sel) => sel.id === emp.id)) {
          initialSelection[idx] = true;
        }
      });
      onRowSelectionChange(initialSelection);
    }
  }, [open, selectedEmployees, employees, onRowSelectionChange]);

  // ambil kandidat yang ter-select dari current page employees
  const candidateSelection = React.useMemo(() => {
    return employees.filter((_, index) => rowSelection[index]);
  }, [rowSelection, employees]);

  return (
    <div className="font-sans my-6">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="font-semibold text-xl">Assign Employees</h2>
              <Badge className="bg-primary-background text-primary rounded-full">
                {selectedEmployees.length} Employee
              </Badge>
            </div>
            <Button onClick={() => setOpen(true)} className="whitespace-nowrap">
              + Add Assignee
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={selectedEmployees}
            customSize={!isMobile}
            pagination={undefined}
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Assign Employee</DialogTitle>
          </DialogHeader>

          <DataTable
            columns={candidateColumns}
            data={employees}
            customSize={!isMobile}
            pagination={tablePagination}
            rowSelection={rowSelection}
            onRowSelectionChange={onRowSelectionChange}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSelectedEmployees((prev) => [
                  ...prev,
                  ...candidateSelection.filter(
                    (c) => !prev.some((p) => p.id === c.id),
                  ),
                ]);
                setOpen(false);
                onRowSelectionChange({});
              }}
            >
              Select Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
