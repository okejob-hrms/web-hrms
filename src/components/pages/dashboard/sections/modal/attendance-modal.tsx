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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboardAnalytics } from '../../hooks/attendance';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardInfo from '@/components/ui/dashboard-info';
import DataTable from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { AttListData } from '@/services/dashboard/types';
import { ColumnDef } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { formatChartMonthLabel } from '@/lib/formatting';
import { resolveLocale } from '@/lib/i18n/locale';

interface AttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AttendanceModal({
  open,
  onOpenChange,
}: AttendanceModalProps) {
  const t = useTranslations('dashboard');
  const tAtt = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const tPayroll = useTranslations('payroll');
  const locale = resolveLocale(useLocale());
  const chartMonth = React.useCallback(
    (period: string) => formatChartMonthLabel(period, locale, 'short'),
    [locale],
  );
  const {
    attendanceStatDetails,
    attStat,
    attStatLoading,
    dataListAtt,
    loadingListAtt,
    dataPaginationAtt,
    search,
    setSearch,
    pagination,
    filters,
    setFilters,
    setPagination,
    branchesData,
    departmentData,
  } = useDashboardAnalytics();

  const onCloseModal = () => {
    setFilters({
      start_date: '',
      end_date: '',
      department_id: '',
      branch_id: '',
    });
    onOpenChange(false);
  };

  const lineData = attendanceStatDetails?.data.map((item) => ({
    month: chartMonth(item.month),
    onTime: item.on_time,
    late: item.late,
    absent: item.absent,
    overtime: item.overtime,
    leave: item.leave,
  }));

  const lineTitle = [
    tAtt('onTime'),
    t('late'),
    tAtt('absent'),
    tAtt('overtime'),
    t('leave'),
  ];
  const lineColor = ['#18618B', '#FFB84D', '#C964A2', '#64C9B1', '#367839'];

  const columns: ColumnDef<AttListData>[] = [
    {
      accessorKey: 'name',
      header: tCommon('name'),
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
      header: t('branch'),
    },
    {
      accessorKey: 'late_clock_in',
      header: tAtt('lateClockIn'),
    },
    {
      accessorKey: 'on_time',
      header: tAtt('onTime'),
    },
    {
      accessorKey: 'early_clock_in',
      header: tAtt('earlyClockIn'),
    },
    {
      accessorKey: 'early_clock_out',
      header: tAtt('earlyClockOut'),
    },
    {
      accessorKey: 'absent',
      header: tAtt('absent'),
    },
    {
      accessorKey: 'leave',
      header: t('leave'),
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
    { title: tAtt('onTime'), value: attStat?.data.on_time.today ?? 0 },
    {
      title: tAtt('lateClockIn'),
      value: attStat?.data.late_clock_in.today ?? 0,
    },
    {
      title: tAtt('earlyClockIn'),
      value: attStat?.data.early_clock_in.today ?? 0,
    },
    {
      title: tAtt('earlyClockOut'),
      value: attStat?.data.early_clock_out.today ?? 0,
    },
    { title: tAtt('overtime'), value: attStat?.data.overtime.today ?? 0 },
    { title: tAtt('absent'), value: attStat?.data.absent.today ?? 0 },
    { title: t('leave'), value: attStat?.data.leave.today ?? 0 },
  ];

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="h-screen w-screen sm:max-w-7xl p-6 rounded-2xl bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('employeeAttendanceTrend')}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1 col-span-1 md:col-span-2">
            <div className="text-xs font-bold text-gray-600">{t('datePeriod')}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                className="w-full"
                name="start_date"
                value={filters.start_date}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }));
                }}
              />
              <Input
                type="date"
                className="w-full"
                name="end_date"
                value={filters.end_date}
                onChange={(e) => {
                  setFilters((prev) => ({
                    ...prev,
                    end_date: e.target.value,
                  }));
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-gray-600">{t('branch')}</div>
            <Select
              value={filters.branch_id}
              onValueChange={(val) => {
                setFilters((prev) => ({
                  ...prev,
                  branch_id: val,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectBranch')} />
              </SelectTrigger>
              <SelectContent>
                {branchesData?.map((item, key) => {
                  return (
                    <SelectItem key={key} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-gray-600">{tCommon('department')}</div>
            <Select
              value={filters.department_id}
              onValueChange={(val) => {
                setFilters((prev) => ({
                  ...prev,
                  department_id: val,
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('selectDepartment')} />
              </SelectTrigger>
              <SelectContent>
                {departmentData?.data.data.map((item, key) => {
                  return (
                    <SelectItem key={key} value={String(item.id)}>
                      {item.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full space-y-5">
          <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <h2 className="font-bold text-xl text-gray-600">
                  {t('attendanceTrend')}
                </h2>
                <div className="text-gray-400 text-sm">
                  {t('lastUpdatedOn', { date: 'December 4, 2025' })}
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
                  {t('attendanceEmployeeTrend')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    className="w-full"
                    value={search}
                    placeholder={tPayroll('searchEmployeeName')}
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
            <Button variant="outline" onClick={() => onCloseModal()}>
              {tCommon('cancel')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
