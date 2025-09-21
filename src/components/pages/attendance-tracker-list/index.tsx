'use client';

import * as React from 'react';
import { DataTable } from '@/components/tables/data-table';
import { PaginationState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Toolbar } from './sections/toolbar';
import { Separator } from '@/components/ui/separator';
import { Filters } from './types';
import { useDebounce } from '@/hooks/use-debounce';
import InfoList from '@/components/ui/info-list';
import { useAttendance } from './hook';

export default function AttendanceTrackerList() {
  const { attendances, columns, loading } = useAttendance();

  const router = useRouter();
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState<Filters>({
    department_ids: [],
    job_position_ids: [],
    search: '',
  });

  const debouncedFilters = useDebounce(filters, 300);
  const queryParams = React.useMemo(
    () => ({
      ...debouncedFilters,
      page: pagination.pageIndex + 1,
      per_page: pagination.pageSize,
    }),
    [debouncedFilters, pagination],
  );

  const handleFiltersChange = React.useCallback((newFilters: Filters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      department_ids:
        newFilters.department_ids !== prev.department_ids
          ? newFilters.department_ids
          : prev.department_ids,
      job_position_ids:
        newFilters.job_position_ids !== prev.job_position_ids
          ? newFilters.job_position_ids
          : prev.job_position_ids,
    }));

    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6">
      <h2 className="font-semibold text-xl">Summary</h2>
      <div className="grid grid-cols-3 gap-6">
        <InfoList
          title="Late Clock In"
          increase="-5"
          compare="vs"
          time="yesterday"
          value={20}
        />
        <InfoList
          title="Easy Clock In"
          increase="-5"
          compare="vs"
          time="yesterday"
          value={80}
        />
        <InfoList
          title="Early Clock Out"
          increase="+10"
          compare="vs"
          time="yesterday"
          value={125}
        />
      </div>
      <div className="grid grid-cols-4 gap-6">
        <InfoList
          title="On Time"
          increase="+10"
          compare="vs"
          time="yesterday"
          value={125}
        />
        <InfoList
          title="Overtime"
          increase="-5"
          compare="vs"
          time="yesterday"
          value={20}
        />
        <InfoList
          title="Absent"
          increase="-5"
          compare="vs"
          time="yesterday"
          value={80}
        />
        <InfoList
          title="Day Off"
          increase="-5"
          compare="vs"
          time="yesterday"
          value={80}
        />
      </div>
      <div className="flex flex-col justify-between gap-6 mt-5">
        <Toolbar onFiltersChange={handleFiltersChange} />
        <Separator />
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-semibold text-xl">Attendance Tracker</h2>
            <Button
              onClick={() => router.push('/attendance/attendance-tracker/add')}
            >
              + New Record Attendance
            </Button>
          </div>
          <DataTable columns={columns} data={attendances} loading={loading} />
        </div>
      </div>
    </div>
  );
}
