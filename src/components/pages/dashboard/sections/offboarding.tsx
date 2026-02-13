'use client';

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Eye, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { useDashboardOffboarding } from '../hooks/offboarding';
import { Skeleton } from '@/components/ui/skeleton';
import DataTable from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ListOff } from '@/services/dashboard/types';
import { Button } from '@/components/ui/button';

type DepartmentChartRow = {
  month: string;
  [key: string]: number | string;
};

export const Offboarding = () => {
  const COLORS: Record<string, string> = {};
  const {
    offStat,
    offStatLoading,
    dataList,
    loadingList,
    dataPagination,
    pagination,
    setPagination,
    search,
    setSearch,
    filters,
    setFilters,
  } = useDashboardOffboarding();

  const columns: ColumnDef<ListOff>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">
            {row.original.user_name}
          </span>
          <span className="text-text-secondary">#{row.original.user_id}</span>
        </div>
      ),
    },
    {
      accessorKey: 'job_position',
      header: 'Position',
    },
    {
      accessorKey: 'job_level',
      header: 'Job Level',
    },
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'join_date',
      header: 'Joined',
    },
    {
      accessorKey: 'last_working_date',
      header: 'Last Working Date',
    },
    {
      accessorKey: 'menu',
      size: 70,
      header: '',
      cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => console.log(row.original.user_id)}
          className="whitespace-nowrap"
        >
          <Eye className="w-4 h-4" />
        </Button>
      ),
    },
  ];

  const lineData = offStat?.data.trend.map((item) => ({
    month: item.month,
    value: item.total,
  }));

  const normalizeKey = (value: string) =>
    value
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

  const deptKeys = Array.from(
    new Set(offStat?.data?.department_date?.map((i) => i.department)),
  );

  const DEPT_MAP = deptKeys.reduce(
    (acc, level) => {
      acc[level] = normalizeKey(level);
      return acc;
    },
    {} as Record<string, string>,
  );

  Object.values(DEPT_MAP).forEach((key, i) => {
    COLORS[key] = ['#8CC8EB', '#80C684', '#FFB84D', '#18618B'][i % 4];
  });

  const departmentData: DepartmentChartRow[] =
    offStat?.data?.department_date?.reduce<DepartmentChartRow[]>(
      (acc, item) => {
        const month = new Date(item.month + '-01').toLocaleString('en-US', {
          month: 'short',
        });

        let row = acc.find((d) => d.month === month);

        if (!row) {
          const newRow: DepartmentChartRow = { month };

          Object.values(DEPT_MAP).forEach((key) => {
            newRow[key] = 0;
          });

          acc.push(newRow);
          row = newRow;
        }

        const key = DEPT_MAP[item.department];
        row[key] = (row[key] as number) + item.total;

        return acc;
      },
      [],
    ) ?? [];

  const jobLevelKeys = Array.from(
    new Set(offStat?.data?.job_level_date?.map((i) => i.job_level)),
  );

  const JOB_LEVEL_MAP = jobLevelKeys.reduce(
    (acc, level) => {
      acc[level] = normalizeKey(level);
      return acc;
    },
    {} as Record<string, string>,
  );

  Object.values(JOB_LEVEL_MAP).forEach((key, i) => {
    COLORS[key] = ['#8CC8EB', '#80C684', '#FFB84D', '#18618B'][i % 4];
  });

  const jobLevelData: DepartmentChartRow[] =
    offStat?.data?.job_level_date?.reduce<DepartmentChartRow[]>((acc, item) => {
      const month = new Date(item.month + '-01').toLocaleString('en-US', {
        month: 'short',
      });

      let row = acc.find((d) => d.month === month);

      if (!row) {
        const newRow: DepartmentChartRow = { month };

        Object.values(JOB_LEVEL_MAP).forEach((key) => {
          newRow[key] = 0;
        });

        acc.push(newRow);
        row = newRow;
      }

      const key = JOB_LEVEL_MAP[item.job_level];
      row[key] = (row[key] as number) + item.total;

      return acc;
    }, []) ?? [];

  const branchKeys = Array.from(
    new Set(offStat?.data?.branch_date?.map((i) => i.branch)),
  );

  const BRANCH_MAP = branchKeys.reduce(
    (acc, level) => {
      acc[level] = normalizeKey(level);
      return acc;
    },
    {} as Record<string, string>,
  );

  Object.values(BRANCH_MAP).forEach((key, i) => {
    COLORS[key] = ['#8CC8EB', '#80C684', '#FFB84D', '#18618B'][i % 4];
  });

  const branchData: DepartmentChartRow[] =
    offStat?.data?.branch_date?.reduce<DepartmentChartRow[]>((acc, item) => {
      const month = new Date(item.month + '-01').toLocaleString('en-US', {
        month: 'short',
      });

      let row = acc.find((d) => d.month === month);

      if (!row) {
        const newRow: DepartmentChartRow = { month };

        Object.values(BRANCH_MAP).forEach((key) => {
          newRow[key] = 0;
        });

        acc.push(newRow);
        row = newRow;
      }

      const key = BRANCH_MAP[item.branch];
      row[key] = (row[key] as number) + item.total;

      return acc;
    }, []) ?? [];

  // -----------------------------
  // COMPONENT CHART
  // -----------------------------

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
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const BarChartDepartment = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={departmentData} barGap={5}>
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

        <Tooltip formatter={(v) => v?.toLocaleString('id-ID')} />
        <Legend height={100} />

        {Object.entries(DEPT_MAP).map(([label, key]) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            name={label}
            fill={COLORS[key] ?? '#8884d8'}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const BarChartJobLevel = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={jobLevelData} barGap={5}>
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

        <Tooltip formatter={(v) => v?.toLocaleString('id-ID')} />
        <Legend height={100} />

        {Object.entries(JOB_LEVEL_MAP).map(([label, key]) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            name={label}
            fill={COLORS[key] ?? '#8884d8'}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const BarChartBranch = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={branchData} barGap={5}>
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

        <Tooltip formatter={(value) => value?.toLocaleString('id-ID')} />

        <Legend height={100} />
        {Object.entries(BRANCH_MAP).map(([label, key]) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            name={label}
            fill={COLORS[key] ?? '#8884d8'}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 py-6">
      <div className="space-y-1">
        <div className="text-xs font-bold text-gray-600">Date Period</div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-4 rounded-xl shadow-sm">
        <div className="col-span-1 md:col-span-3 space-y-3">
          <div className="flex gap-3 items-center">
            <h2 className="font-bold text-xl text-gray-600">
              Offboarding Employee
            </h2>
            <div className="text-gray-400 text-sm">
              Last Updated: December 4, 2025
            </div>
            <RefreshCcw size={14} className="text-gray-700" />
          </div>
          <div className="text-gray-600">Total Resigned Employees</div>
          <h2 className="font-bold text-2xl text-primary">
            {formatCurrency(offStat?.data.total ?? 0)}
          </h2>
        </div>

        {/* CHART FULL WIDTH */}
        <div className="col-span-1 md:col-span-3">
          <LineChartComponent />
        </div>

        {/* CHART 1 */}
        <div className="col-span-1">
          <h2 className="font-semibold text-center mb-2">By Department</h2>
          <BarChartDepartment />
        </div>

        {/* CHART 2 */}
        <div className="col-span-1">
          <h2 className="font-semibold text-center mb-2">By Job Level</h2>
          <BarChartJobLevel />
        </div>

        {/* CHART 3 */}
        <div className="col-span-1">
          <h2 className="font-semibold text-center mb-2">By Branch</h2>
          <BarChartBranch />
        </div>
      </div>

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

          {loadingList ? (
            <div className="flex flex-col gap-4 items-center w-full">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-30 w-full" />
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={dataList?.data}
              pagination={dataPagination}
              paginationState={pagination}
              setPaginationState={setPagination}
            />
          )}
        </div>
      </div>
    </div>
  );
};
