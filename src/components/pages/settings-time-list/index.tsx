'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAttendance, WorkingHour } from './hook';

// =======================
// Table Columns
// =======================
const columns: ColumnDef<WorkingHour>[] = [
  {
    id: 'day',
    header: 'Day',
    size: 160,
    cell: ({ row, table }) => {
      const day = row.original.day;

      // semua row di tabel
      const allRows = table.getRowModel().rows;
      // filter row yang sama harinya
      const sameDayRows = allRows.filter((r) => r.original.day === day);

      const firstRowId = sameDayRows[0].id;

      if (row.id === firstRowId) {
        return (
          <td rowSpan={sameDayRows.length} className="px-4 py-2">
            {day}
          </td>
        );
      }

      return null; // biarin kosong, rowSpan sudah cover
    },
  },
  { accessorKey: 'shift', header: 'Shift', size: 160 },
  { accessorKey: 'workingHours', header: 'Working Hours', size: 200 },
  { accessorKey: 'break', header: 'Break', size: 160 },
];

export default function SettingsAttendanceConfiguration() {
  const router = useRouter();
  const { data, isLoading, isError } = useAttendance();

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p>Failed to load company profile</p>;

  const { workingHours, late_tolerance, max_late_tolerance } = data;

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex flex-row justify-between">
            <h2 className="font-semibold text-xl">Attendance Configuration</h2>
            <Button
              variant="outline"
              className="flex flex-row gap-6"
              onClick={() =>
                router.push(
                  '/settings/time-attendance/attendance-configuration/edit',
                )
              }
            >
              <Edit3 />
              Edit Attendance Configuration
            </Button>
          </div>
          <DataTable columns={columns} data={workingHours} />

          <div className="font-bold text-md mt-5">
            Grace Period & Absent Threshold
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-gray-500">Grace Period (Late Tolerance)</div>
              <div className="text-gray-500">
                {late_tolerance ?? '-'} minutes
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-gray-500">Absent After</div>
              <div className="text-gray-500">
                {max_late_tolerance ?? '-'} minutes after start shift
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
