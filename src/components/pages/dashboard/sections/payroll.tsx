'use client';

import * as React from 'react';
import DashboardInfo from '@/components/ui/dashboard-info';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useDashboardPayroll } from '../hooks/payroll';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

export const Payroll = () => {
  const {
    payrolls,
    payrollsLoading,
    search,
    setSearch,
    filters,
    setFilters,
    payrollTrend,
    payrollTrendLoading,
  } = useDashboardPayroll();

  const pannel = [
    {
      title: 'Base Salary',
      increase: payrolls?.data.base_salary.percentage_change,
      value: payrolls?.data.base_salary.last_year_count,
    },
    {
      title: 'Allowance',
      increase: payrolls?.data.allowance.percentage_change,
      value: payrolls?.data.allowance.last_year_count,
    },
    {
      title: 'Overtime',
      increase: payrolls?.data.overtime_payroll.percentage_change,
      value: payrolls?.data.overtime_payroll.last_year_count,
    },
    { title: 'Salary Deduction (Employee)', increase: 0, value: 0 },
    { title: 'Salary Dedcution (Employer)', increase: 0, value: 0 },
    {
      title: 'Penalties',
      increase: payrolls?.data.penalties.percentage_change,
      value: payrolls?.data.penalties.percentage_change,
    },
    {
      title: 'Payslip Request',
      increase: payrolls?.data.payslip.percentage_change,
      value: payrolls?.data.payslip.percentage_change,
    },
  ];

  const data = payrollTrend?.data.map((item) => ({
    month: item.month,
    overtime: item.overtime,
    allowance: item.allowance,
    total: item.total_salary,
  }));

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 py-6">
      {payrollsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pannel.map((item, id) => {
            return (
              <DashboardInfo
                key={id}
                title={item.title}
                increase={item.increase}
                value={item.value}
              />
            );
          })}
        </div>
      )}
      <div className="flex flex-col justify-between gap-6 mt-5">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-bold text-xl text-gray-600">Sum of Payroll</h2>
          </div>

          <div className="space-y-1">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} barGap={5}>
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
                width={100}
                tickFormatter={(v) =>
                  'Rp ' + (v / 1000).toLocaleString('id-ID') + 'k'
                }
              />

              <Tooltip
                formatter={(value) => 'Rp ' + value?.toLocaleString('id-ID')}
              />

              <Legend />

              {/* Order follows stacking from bottom to top */}
              <Bar
                dataKey="overtime"
                stackId="a"
                name="Overtime"
                fill="#6bd8c8"
                barSize={40}
              />
              <Bar
                dataKey="allowance"
                stackId="a"
                name="Allowance"
                fill="#ffc159"
                barSize={40}
              />
              <Bar
                dataKey="total"
                stackId="a"
                name="Total Salary"
                fill="#1b5e7d"
                barSize={40}
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
