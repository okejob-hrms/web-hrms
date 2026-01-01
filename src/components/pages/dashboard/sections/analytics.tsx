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
import { Maximize2, RefreshCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDashboardAnalytics } from '../hooks/attendance';
import AttendanceModal from './modal/attendance-modal';
import { Button } from '@/components/ui/button';
import ExperienceModal from './modal/experience-modal';
import AdditionalModal from './modal/additional-modal';

export const Analytics = () => {
  const {
    attendanceStat,
    employeeStat,
    experienceStat,
    ageStat,
    genderStat,
    additionalStat,
    setTypeAdditional,
  } = useDashboardAnalytics();

  const [openAttendance, setOpenAttendance] = React.useState(false);
  const [openExperience, setOpenExperience] = React.useState(false);
  const [openAdditional, setOpenAdditional] = React.useState(false);

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
  const dougColor = [
    '#8CC8EB',
    '#FFB84D',
    '#18618B',
    '#EAF6FC',
    '#FFD79B',
    '#18618B',
    '#FFB84D',
    '#C964A2',
    '#64C9B1',
    '#367839',
    '#CCDDCC',
  ];

  const employeeData =
    employeeStat?.data.details.map((item, i) => ({
      name: item.name,
      value: item.total_employees,
      color: dougColor[i],
    })) ?? [];

  const experienceData = [
    {
      name: 'Fresh Graduate',
      value: experienceStat?.data.fresh_graduate,
      color: '#0A2636',
    },
    {
      name: 'Experienced',
      value: experienceStat?.data.experienced,
      color: '#8CC9E8',
    },
  ];

  const spread =
    ageStat?.data.map((item) => ({
      year: item.generation,
      value: item.total,
    })) ?? [];

  const genderData =
    genderStat?.data.map((item, i) => ({
      name: item.gender,
      value: item.total,
      color: dougColor[i],
    })) ?? [];

  const positionList =
    additionalStat?.data.job_position
      ?.slice()
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item, i) => ({
        name: item.name,
        value: item.total,
        color: dougColor[i],
      })) ?? [];

  const teamsList =
    additionalStat?.data.teams
      ?.slice()
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item, i) => ({
        name: item.name,
        value: item.total,
        color: dougColor[i],
      })) ?? [];

  const lvlList =
    additionalStat?.data.job_level
      ?.slice()
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item, i) => ({
        name: item.name,
        value: item.total,
        color: dougColor[i],
      })) ?? [];

  const departmentsList =
    additionalStat?.data.departments
      ?.slice()
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((item, i) => ({
        name: item.name,
        value: item.total,
        color: dougColor[i],
      })) ?? [];

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
          <span className="text-xl font-semibold text-primary">
            {employeeStat?.data.total_employee}
          </span>
          <span className="text-xs text-gray-400">Employees</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mt-4">
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
          <span className="text-xl font-semibold text-primary">
            {experienceStat?.data.total}
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

  const SpreadChart = () => (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={spread} barGap={5}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="year"
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
          width={40}
        />

        <Tooltip formatter={(value) => value.toLocaleString('id-ID')} />

        {/* Order follows stacking from bottom to top */}
        <Bar dataKey="value" stackId="a" name="" fill="#18618B" barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );

  const GenderChart = () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="w-full md:w-1/2 h-[240px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={genderData}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              stroke="none"
            >
              {genderData.map((item, index) => (
                <Cell key={index} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-semibold text-primary">
            {experienceStat?.data.total}
          </span>
          <span className="text-xs text-gray-400">Employees</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-row gap-3 mt-4">
        {genderData.map((item, index) => (
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

  const PositionChart = () => (
    <div className="space-y-3 mt-4">
      {positionList.map((item, index) => (
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
  );

  const TeamsChart = () => (
    <div className="space-y-3 mt-4">
      {teamsList.map((item, index) => (
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
  );

  const JobLevelChart = () => (
    <div className="space-y-3 mt-4">
      {lvlList.map((item, index) => (
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
  );

  const DepartmentsChart = () => (
    <div className="space-y-3 mt-4">
      {departmentsList.map((item, index) => (
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
  );

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <Button variant="link" onClick={() => setOpenAttendance(true)}>
              <Maximize2 className="text-gray-900" />
            </Button>
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
            <Button variant="link" onClick={() => setOpenExperience(true)}>
              <Maximize2 className="text-gray-900" />
            </Button>
          </div>
          <ExperienceChart />
        </div>

        <div className="col-span-4 md:col-span-2 space-y-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <h2 className="font-bold text-xl text-gray-600">Age Spread</h2>
              <div className="text-gray-400 text-sm">
                Last Updated: December 4, 2025
              </div>
              <RefreshCcw size={14} className="text-gray-700" />
            </div>
            <Maximize2 className="text-gray-900" />
          </div>
          <SpreadChart />
        </div>

        <div className="col-span-4 md:col-span-2 space-y-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <h2 className="font-bold text-xl text-gray-600">Gender Spread</h2>
              <div className="text-gray-400 text-sm">
                Last Updated: December 4, 2025
              </div>
              <RefreshCcw size={14} className="text-gray-700" />
            </div>
          </div>
          <GenderChart />
        </div>

        <div className="col-span-4 md:col-span-1 space-y-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <h2 className="font-bold text-xl text-gray-600">Position</h2>
            </div>
            <Button
              variant="link"
              onClick={() => {
                setTypeAdditional('job_position');
                setOpenAdditional(true);
              }}
            >
              <Maximize2 className="text-gray-900" />
            </Button>
          </div>
          <PositionChart />
        </div>

        <div className="col-span-4 md:col-span-1 space-y-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <h2 className="font-bold text-xl text-gray-600">Teams</h2>
            </div>
            <Button
              variant="link"
              onClick={() => {
                setTypeAdditional('teams');
                setOpenAdditional(true);
              }}
            >
              <Maximize2 className="text-gray-900" />
            </Button>
          </div>
          <TeamsChart />
        </div>

        <div className="col-span-4 md:col-span-1 space-y-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <h2 className="font-bold text-xl text-gray-600">Job Level</h2>
            </div>
            <Button
              variant="link"
              onClick={() => {
                setTypeAdditional('job_level');
                setOpenAdditional(true);
              }}
            >
              <Maximize2 className="text-gray-900" />
            </Button>
          </div>
          <JobLevelChart />
        </div>

        <div className="col-span-4 md:col-span-1 space-y-3 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-center">
              <h2 className="font-bold text-xl text-gray-600">Departments</h2>
            </div>
            <Button
              variant="link"
              onClick={() => {
                setTypeAdditional('department');
                setOpenAdditional(true);
              }}
            >
              <Maximize2 className="text-gray-900" />
            </Button>
          </div>
          <DepartmentsChart />
        </div>
      </div>

      <AttendanceModal open={openAttendance} onOpenChange={setOpenAttendance} />
      <ExperienceModal open={openExperience} onOpenChange={setOpenExperience} />
      <AdditionalModal open={openAdditional} onOpenChange={setOpenAdditional} />
    </div>
  );
};
