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

interface AttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AttendanceModal({
  open,
  onOpenChange,
}: AttendanceModalProps) {
  const { attendanceStat, attStat, attStatLoading } = useDashboardAnalytics();

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
      <DialogContent className="h-screen w-screen sm:max-w-7xl p-6 rounded-2xl bg-white">
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
