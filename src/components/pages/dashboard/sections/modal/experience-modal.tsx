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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDashboardAnalytics } from '../../hooks/attendance';
import { Skeleton } from '@/components/ui/skeleton';
import DataTable from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { ExpTrendListData } from '@/services/dashboard/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExperienceModal({
  open,
  onOpenChange,
}: ExperienceModalProps) {
  const {
    experienceStatDetail,
    experienceTrend,
    loadingListAtt,
    paginationExp,
    searchExp,
    dataListExpTrend,
    dataPaginationExpTrend,
    setPaginationExp,
    setSearchExp,
    setFilters,
    filters,
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

  const experienceData = [
    {
      name: 'Fresh Graduate',
      value: experienceStatDetail?.data.fresh_graduate,
      color: '#0A2636',
    },
    {
      name: 'Experienced',
      value: experienceStatDetail?.data.experienced,
      color: '#8CC9E8',
    },
  ];

  const lineData = experienceTrend?.data.map((item) => ({
    month: item.year,
    experienced: item.experienced,
    fresh_graduate: item.fresh_graduate,
  }));

  const lineTitle = ['Experienced', 'Fresh Graduate'];
  const lineColor = ['#18618B', '#FFB84D'];

  const columns: ColumnDef<ExpTrendListData>[] = [
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
      accessorKey: 'job_position',
      header: 'Postion',
    },
    {
      accessorKey: 'branch_name',
      header: 'Branch',
    },
    {
      accessorKey: 'experience_years',
      header: 'Experience',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 160,
      cell: ({ row }) => {
        const expert = row.original.experience_years > 0;

        return (
          <Badge
            variant="default"
            className={
              expert
                ? 'bg-blue-100 text-blue-700'
                : 'bg-yellow-100 text-yellow-700'
            }
          >
            {expert ? 'Expereienced' : 'Fresh Graduate'}
          </Badge>
        );
      },
    },
  ];

  const ExperienceChart = () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="w-full h-[240px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={experienceData}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {experienceData.map((item, index) => (
                <Cell key={index} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-semibold text-primary">
            {experienceStatDetail?.data.total}
          </span>
          <span className="text-xs text-gray-400">Employees</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-row gap-3 mt-4">
        {experienceData.map((item, index) => (
          <div key={index} className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded shrink-0 mt-1"
                style={{ backgroundColor: item.color }}
              />
              <div>
                <div className="text-xl font-semibold text-foreground">
                  {item.value}
                </div>
                <div className="text-xs text-foreground">{item.name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
          dataKey="experienced"
          stroke="#18618B"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="fresh_graduate"
          stroke="#FFB84D"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Dialog open={open} onOpenChange={onCloseModal}>
      <DialogContent className="h-screen w-screen sm:max-w-7xl p-6 rounded-2xl bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Employee Experience Level</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-1 col-span-1 md:col-span-2">
            <div className="text-xs font-bold text-gray-600">Date Period</div>
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
            <div className="text-xs font-bold text-gray-600">Branch</div>
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
                <SelectValue placeholder="Select branch" />
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
            <div className="text-xs font-bold text-gray-600">Departement</div>
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
                <SelectValue placeholder="Select departement" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 rounded-md bg-white border shadow-sm border-gray-200 p-6">
              <ExperienceChart />
            </div>
            <div className="col-span-1 md:col-span-2 space-y-3 rounded-md bg-white border shadow-sm border-gray-200 p-6">
              <div className="flex flex-row gap-3 mt-4 justify-end">
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
              <LineChartComponent />
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 mt-5">
            <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    className="w-full"
                    value={searchExp}
                    placeholder="Search employee name"
                    onChange={(e) => {
                      setSearchExp(e.target.value);
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
                  data={dataListExpTrend?.data}
                  pagination={dataPaginationExpTrend}
                  paginationState={paginationExp}
                  setPaginationState={setPaginationExp}
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6 flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onCloseModal()}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
