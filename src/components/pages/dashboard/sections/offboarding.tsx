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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@radix-ui/react-separator';

export const Offboarding = () => {
  const lineData = [
    { month: 'Jan', value: 4 },
    { month: 'Feb', value: 8 },
    { month: 'Mar', value: 3 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 4 },
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 3 },
    { month: 'Aug', value: 2 },
    { month: 'Sep', value: 5 },
    { month: 'Oct', value: 4 },
    { month: 'Nov', value: 4 },
    { month: 'Dec', value: 8 },
  ];

  const departmentData = [
    {
      month: 'Jan',
      admin: 1,
      service: 0,
      tech: 0,
      sales: 2,
      operations: 0,
      production: 1,
    },
    {
      month: 'Feb',
      admin: 0,
      service: 1,
      tech: 0,
      sales: 3,
      operations: 0,
      production: 0,
    },
    {
      month: 'Mar',
      admin: 0,
      service: 0,
      tech: 0,
      sales: 1,
      operations: 0,
      production: 0,
    },
    {
      month: 'Apr',
      admin: 0,
      service: 0,
      tech: 0,
      sales: 0,
      operations: 0,
      production: 0,
    },
    {
      month: 'May',
      admin: 0,
      service: 0,
      tech: 0,
      sales: 2,
      operations: 1,
      production: 0,
    },
    {
      month: 'Jun',
      admin: 0,
      service: 0,
      tech: 0,
      sales: 0,
      operations: 0,
      production: 0,
    },
    {
      month: 'Jul',
      admin: 0,
      service: 0,
      tech: 0,
      sales: 3,
      operations: 0,
      production: 1,
    },
    {
      month: 'Aug',
      admin: 1,
      service: 1,
      tech: 0,
      sales: 2,
      operations: 0,
      production: 0,
    },
    {
      month: 'Sep',
      admin: 0,
      service: 0,
      tech: 1,
      sales: 1,
      operations: 0,
      production: 0,
    },
    {
      month: 'Oct',
      admin: 1,
      service: 0,
      tech: 0,
      sales: 4,
      operations: 0,
      production: 0,
    },
    {
      month: 'Nov',
      admin: 0,
      service: 1,
      tech: 0,
      sales: 2,
      operations: 0,
      production: 1,
    },
    {
      month: 'Dec',
      admin: 1,
      service: 0,
      tech: 0,
      sales: 1,
      operations: 1,
      production: 0,
    },
  ];

  const jobLevelData = [
    {
      month: 'Jan',
      director: 1,
      manager: 2,
      teamLeader: 0,
      senior: 1,
      medior: 0,
      junior: 0,
    },
    {
      month: 'Feb',
      director: 0,
      manager: 2,
      teamLeader: 2,
      senior: 0,
      medior: 0,
      junior: 0,
    },
    {
      month: 'Mar',
      director: 1,
      manager: 0,
      teamLeader: 0,
      senior: 0,
      medior: 0,
      junior: 0,
    },
    {
      month: 'Apr',
      director: 0,
      manager: 0,
      teamLeader: 0,
      senior: 0,
      medior: 0,
      junior: 0,
    },
    {
      month: 'May',
      director: 2,
      manager: 0,
      teamLeader: 0,
      senior: 0,
      medior: 0,
      junior: 0,
    },
    {
      month: 'Jun',
      director: 0,
      manager: 0,
      teamLeader: 0,
      senior: 0,
      medior: 0,
      junior: 0,
    },
    {
      month: 'Jul',
      director: 0,
      manager: 1,
      teamLeader: 3,
      senior: 0,
      medior: 0,
      junior: 1,
    },
    {
      month: 'Aug',
      director: 0,
      manager: 0,
      teamLeader: 0,
      senior: 0,
      medior: 0,
      junior: 3,
    },
    {
      month: 'Sep',
      director: 0,
      manager: 0,
      teamLeader: 0,
      senior: 0,
      medior: 1,
      junior: 0,
    },
    {
      month: 'Oct',
      director: 0,
      manager: 0,
      teamLeader: 0,
      senior: 0,
      medior: 1,
      junior: 0,
    },
    {
      month: 'Nov',
      director: 1,
      manager: 0,
      teamLeader: 0,
      senior: 0,
      medior: 1,
      junior: 0,
    },
    {
      month: 'Dec',
      director: 2,
      manager: 0,
      teamLeader: 5,
      senior: 0,
      medior: 0,
      junior: 0,
    },
  ];

  const branchData = [
    { month: 'Jan', caturPrima: 1, caturSakti: 0, ciputra: 0 },
    { month: 'Feb', caturPrima: 1, caturSakti: 0, ciputra: 1 },
    { month: 'Mar', caturPrima: 3, caturSakti: 1, ciputra: 1 },
    { month: 'Apr', caturPrima: 0, caturSakti: 0, ciputra: 0 },
    { month: 'May', caturPrima: 3, caturSakti: 2, ciputra: 1 },
    { month: 'Jun', caturPrima: 0, caturSakti: 0, ciputra: 0 },
    { month: 'Jul', caturPrima: 0, caturSakti: 4, ciputra: 0 },
    { month: 'Aug', caturPrima: 0, caturSakti: 5, ciputra: 0 },
    { month: 'Sep', caturPrima: 0, caturSakti: 0, ciputra: 0 },
    { month: 'Oct', caturPrima: 0, caturSakti: 2, ciputra: 0 },
    { month: 'Nov', caturPrima: 5, caturSakti: 0, ciputra: 0 },
    { month: 'Dec', caturPrima: 0, caturSakti: 4, ciputra: 3 },
  ];

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

        <Tooltip formatter={(v) => v.toLocaleString('id-ID')} />
        <Legend height={100} />

        <Bar
          dataKey="admin"
          stackId="a"
          name="Corporate & Administration"
          fill="#8CC8EB"
        />
        <Bar
          dataKey="service"
          stackId="a"
          name="Service & Retail"
          fill="#80C684"
        />
        <Bar
          dataKey="tech"
          stackId="a"
          name="Technology & Digital"
          fill="#FFB84D"
        />
        <Bar
          dataKey="sales"
          stackId="a"
          name="Sales & Marketing"
          fill="#18618B"
        />
        <Bar
          dataKey="operations"
          stackId="a"
          name="Manufacturing & Ops"
          fill="#E0A8CB"
        />
        <Bar
          dataKey="production"
          stackId="a"
          name="Staff Production"
          fill="#2A7866"
        />
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

        <Tooltip formatter={(v) => v.toLocaleString('id-ID')} />
        <Legend height={100} />

        <Bar dataKey="director" stackId="a" name="Director" fill="#8CC8EB" />
        <Bar dataKey="manager" stackId="a" name="Manager" fill="#80C684" />
        <Bar
          dataKey="teamLeader"
          stackId="a"
          name="Team Leader"
          fill="#FFB84D"
        />
        <Bar dataKey="senior" stackId="a" name="Senior Staff" fill="#18618B" />
        <Bar dataKey="medior" stackId="a" name="Medior Staff" fill="#E0A8CB" />
        <Bar dataKey="junior" stackId="a" name="Junior Staff" fill="#2A7866" />
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

        <Tooltip formatter={(value) => value.toLocaleString('id-ID')} />

        <Legend height={100} />
        <Bar
          dataKey="caturPrima"
          name="PT Catur Prima Sejahtera"
          fill="#0d47a1"
          barSize={40}
          stackId="a"
        />
        <Bar
          dataKey="caturSakti"
          name="PT Catur Sakti Sejahtera"
          fill="#263238"
          barSize={40}
          stackId="a"
        />
        <Bar
          dataKey="ciputra"
          name="PT Ciputra"
          fill="#455a64"
          barSize={40}
          stackId="a"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 py-6">
      <div className="space-y-1">
        <div className="text-xs font-bold text-gray-600">Date Period</div>
        <Input
          type="date"
          className="w-full"
          name="date"
          onChange={(e) => {
            console.log(e);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 bg-white p-4 rounded-xl shadow-sm">
        <div className="col-span-3 space-y-3">
          <div className="flex gap-3 items-center">
            <h2 className="font-bold text-xl text-gray-600">
              Attendance Trend
            </h2>
            <div className="text-gray-400 text-sm">
              Last Updated: December 4, 2025
            </div>
            <RefreshCcw size={14} className="text-gray-700" />
          </div>
          <div className="text-gray-600">Total Resigned Employees</div>
          <h2 className="font-bold text-2xl text-primary">
            {formatCurrency(50)}
          </h2>
        </div>
        {/* CHART FULL WIDTH */}
        <div className="col-span-1 md:col-span-3">
          <LineChartComponent />
        </div>

        {/* CHART 1 */}
        <div className="">
          <h2 className="font-semibold text-center mb-2">By Department</h2>
          <BarChartDepartment />
        </div>

        {/* CHART 2 */}
        <div className="">
          <h2 className="font-semibold text-center mb-2">By Job Level</h2>
          <BarChartJobLevel />
        </div>

        {/* CHART 3 */}
        <div className="">
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
                placeholder="Search employee name"
                onChange={(e) => {
                  console.log(e);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
