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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Maximize2, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Separator } from '@radix-ui/react-separator';

export const Analytics = () => {
  const lineData = [
    { month: 'Jan', onTime: 14, late: 1, absent: 2, overtime: 3, leave: 1 },
    { month: 'Feb', onTime: 18, late: 1, absent: 2, overtime: 3, leave: 0 },
    { month: 'Mar', onTime: 13, late: 0, absent: 2, overtime: 7, leave: 0 },
    { month: 'Apr', onTime: 10, late: 4, absent: 2, overtime: 7, leave: 0 },
    { month: 'May', onTime: 14, late: 0, absent: 2, overtime: 3, leave: 2 },
    { month: 'Jun', onTime: 10, late: 2, absent: 2, overtime: 3, leave: 2 },
    { month: 'Jul', onTime: 17, late: 1, absent: 1, overtime: 2, leave: 1 },
    { month: 'Aug', onTime: 12, late: 2, absent: 2, overtime: 6, leave: 2 },
    { month: 'Sep', onTime: 13, late: 1, absent: 2, overtime: 4, leave: 1 },
    { month: 'Oct', onTime: 14, late: 1, absent: 2, overtime: 5, leave: 1 },
    { month: 'Nov', onTime: 12, late: 3, absent: 2, overtime: 4, leave: 1 },
    { month: 'Dec', onTime: 16, late: 1, absent: 2, overtime: 3, leave: 1 },
  ];
  const lineTitle = ['On Time', 'Late', 'Absent', 'Overtime', 'Leave'];
  const lineColor = ['#18618B', '#FFB84D', '#C964A2', '#64C9B1', '#367839'];

  const employeeData = [
    { name: 'PT Catur Prima Sejahtera', value: 320, color: '#0A2636' },
    { name: 'PT Glory Makmur', value: 100, color: '#8CC9E8' },
    { name: 'PT Catur Sakti Sejahtera', value: 500, color: '#1F5E82' },
    { name: 'PT Ciputra', value: 100, color: '#6FB7DD' },
    { name: 'PT Lentera Bangsa', value: 80, color: '#CDEAF8' },
    { name: 'PT Maju Sentosa', value: 100, color: '#EAF6FC' },
  ];

  const experienceData = [
    { name: 'Fresh Graduate', value: 320, color: '#0A2636' },
    { name: 'Experienced', value: 100, color: '#8CC9E8' },
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

  const EmployeeChart = () => (
    <div className="flex flex-col md:flex-row gap-8 items-center">
      <div className="w-full md:w-1/2 h-[240px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={employeeData}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {employeeData.map((item, index) => (
                <Cell key={index} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-semibold text-primary">{100000}</span>
          <span className="text-xs text-gray-400">Employees</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 mt-4">
        {employeeData.map((item, index) => (
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

  const ExperienceChart = () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="w-full md:w-1/2 h-[240px] relative">
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
          <span className="text-xl font-semibold text-primary">{100000}</span>
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

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 py-6">
      <div className="grid grid-cols-4 gap-6">
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
        <div className="space-y-1">
          <div className="text-xs font-bold text-gray-600">Branch</div>
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
        <div className="space-y-1">
          <div className="text-xs font-bold text-gray-600">Departement</div>
          <Select
            // value={}
            onValueChange={(val) => {
              console.log(val);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select departement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Department 1">Department 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        <div className="col-span-4 space-y-3 bg-white p-4 rounded-xl shadow-sm">
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
            <Maximize2 className="text-gray-900" />
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
        <div className="col-span-4 md:col-span-2 space-y-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <h2 className="font-bold text-xl text-gray-600">
                Total Employees
              </h2>
              <div className="text-gray-400 text-sm">
                Last Updated: December 4, 2025
              </div>
              <RefreshCcw size={14} className="text-gray-700" />
            </div>
          </div>
          <EmployeeChart />
        </div>
        <div className="col-span-4 md:col-span-2 space-y-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <h2 className="font-bold text-xl text-gray-600">
                Experience Level
              </h2>
              <div className="text-gray-400 text-sm">
                Last Updated: December 4, 2025
              </div>
              <RefreshCcw size={14} className="text-gray-700" />
            </div>
            <Maximize2 className="text-gray-900" />
          </div>
          <ExperienceChart />
        </div>
      </div>
    </div>
  );
};
