'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useDashboardAnalytics } from '../../hooks/attendance';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardInfo from '@/components/ui/dashboard-info';
import DataTable from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { AttListData } from '@/services/dashboard/types';
import { ColumnDef } from '@tanstack/react-table';

interface AttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AttendanceModal({
  open,
  onOpenChange,
}: AttendanceModalProps) {
  const {
    attendanceStat,
    attStat,
    attStatLoading,
    dataListAtt,
    loadingListAtt,
    dataPaginationAtt,
    search,
    setSearch,
    pagination,
    setPagination,
  } = useDashboardAnalytics();

  const lineData = attendanceStat?.data.map((item) => ({
    month: item.month,
    onTime: item.on_time,
    late: item.late,
    absent: item.absent,
    overtime: item.overtime,
    leave: item.leave,
  }));

  const lineTitle = ['On Time', 'Late', 'Absent', 'Overtime', 'Leave'];
  const lineColor = ['#18618B', '#FFB84D', '#C964A2', '#64C9B1', '#367839'];

  const columns: ColumnDef<AttListData>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">
            {row.original.name}
          </span>
          <span className="text-text-secondary">#{row.original.user_id}</span>
        </div>
      ),
    },
    {
      accessorKey: 'branch_name',
      header: 'Branch',
    },
    {
      accessorKey: 'late_clock_in',
      header: 'Late Clock In',
    },
    {
      accessorKey: 'on_time',
      header: 'On Time',
    },
    {
      accessorKey: 'early_clock_in',
      header: 'Early Clock In',
    },
    {
      accessorKey: 'early_clock_out',
      header: 'Early Clock Out',
    },
    {
      accessorKey: 'absent',
      header: 'Absent',
    },
    {
      accessorKey: 'leave',
      header: 'Leave',
    },
  ];

  const LineChartComponent = () => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={lineData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          stroke="#6b7280"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 13, fill: '#9ca3af' }}
        />
        <YAxis
          stroke="#6b7280"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tick={{ fontSize: 13, fill: '#9ca3af' }}
          width={30}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="onTime"
          stroke="#18618B"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="late"
          stroke="#FFB84D"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="absent"
          stroke="#C964A2"
          strokeWidth={2}
          dot={false}
        />

        <Line
          type="monotone"
          dataKey="overtime"
          stroke="#64C9B1"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="leave"
          stroke="#367839"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const pannel = [
    {
      title: 'On Time',
      value: attStat?.data.on_time.today ?? 0,
    },
    {
      title: 'Late Clock In',
      value: attStat?.data.late_clock_in.today ?? 0,
    },
    {
      title: 'Early Clock In',
      value: attStat?.data.early_clock_in.today ?? 0,
    },
    {
      title: 'Early Clock Out',
      value: attStat?.data.early_clock_out.today ?? 0,
    },
    {
      title: 'Overtime',
      value: attStat?.data.overtime.today ?? 0,
    },
    {
      title: 'Absent',
      value: attStat?.data.absent.today ?? 0,
    },
    {
      title: 'Leave',
      value: attStat?.data.leave.today ?? 0,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-screen w-screen sm:max-w-7xl p-6 rounded-2xl bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Attendance Trend</DialogTitle>
        </DialogHeader>

        <div className="w-full space-y-5">
          <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <h2 className="font-bold text-xl text-gray-600">
                  Attendance Trend
                </h2>
                <div className="text-gray-400 text-sm">
                  Last Updated: December 4, 2025
                </div>
                <RefreshCcw size={14} className="text-gray-700" />
              </div>
            </div>
            <LineChartComponent />
            <div className="flex flex-row gap-3 mt-4 justify-center">
              {lineTitle.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded shrink-0"
                      style={{ backgroundColor: lineColor[index] }}
                    />
                    <div>
                      <div className="text-xs text-foreground">{item}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {attStatLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {pannel.map((item, id) => (
                <DashboardInfo key={id} title={item.title} value={item.value} />
              ))}
            </div>
          )}

          <div className="flex flex-col justify-between gap-6 mt-5">
            <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
              <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
                <h2 className="font-bold text-xl text-gray-600">
                  Recent Resigned Employee
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    className="w-full"
                    value={search}
                    placeholder="Search employee name"
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>
              </div>

              {loadingListAtt ? (
                <div className="flex flex-col gap-4 items-center w-full">
                  <Skeleton className="h-12 w-full" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-30 w-full" />
                  </div>
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={dataListAtt?.data}
                  pagination={dataPaginationAtt}
                  paginationState={pagination}
                  setPaginationState={setPagination}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6 flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
