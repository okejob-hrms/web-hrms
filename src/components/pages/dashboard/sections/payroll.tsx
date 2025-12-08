'use client';

import * as React from 'react';
import InfoList from '@/components/ui/info-list';
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

export const Payroll = () => {
  const pannel = [
    { title: 'Base Salary', increase: -10, value: 400000000 },
    { title: 'Allowance', increase: 8, value: 20000000 },
    { title: 'Overtime', increase: 9, value: 10000000 },
    { title: 'Salary Deduction (Employee)', increase: -10, value: 52100000 },
    { title: 'Salary Dedcution (Employer)', increase: 20, value: 94000000 },
    { title: 'Penalties', increase: 10, value: 2000000000 },
    { title: 'Payslip Request', increase: -5, value: 120 },
  ];

  const data = [
    { month: 'Jan', overtime: 300000, allowance: 300000, total: 250000 },
    { month: 'Feb', overtime: 350000, allowance: 320000, total: 280000 },
    { month: 'Mar', overtime: 250000, allowance: 280000, total: 210000 },
    { month: 'Apr', overtime: 320000, allowance: 310000, total: 260000 },
    { month: 'May', overtime: 240000, allowance: 270000, total: 200000 },
    { month: 'Jun', overtime: 360000, allowance: 300000, total: 290000 },
    { month: 'Jul', overtime: 310000, allowance: 290000, total: 250000 },
    { month: 'Aug', overtime: 320000, allowance: 300000, total: 260000 },
    { month: 'Sep', overtime: 300000, allowance: 290000, total: 250000 },
    { month: 'Oct', overtime: 330000, allowance: 310000, total: 270000 },
    { month: 'Nov', overtime: 350000, allowance: 320000, total: 300000 },
    { month: 'Dec', overtime: 280000, allowance: 300000, total: 250000 },
  ];

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 py-6">
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
      <div className="flex flex-col justify-between gap-6 mt-5">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-semibold text-xl">Sum of Payroll</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select
                // value={}
                onValueChange={(val) => {
                  console.log(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Branch 1">Branch 1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                // value={}
                onValueChange={(val) => {
                  console.log(val);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Department 1">Department 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data} barGap={5}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" />

              <YAxis
                width={100}
                tickFormatter={(v) =>
                  'Rp ' + (v / 1000).toLocaleString('id-ID') + 'k'
                }
              />

              <Tooltip
                formatter={(value) => 'Rp ' + value.toLocaleString('id-ID')}
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
