'use client';

import * as React from 'react';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Attendance } from '@/services/attendance/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit3, Ellipsis, Eye, Search, Trash } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getStatusAttendance } from '@/lib/helpers';
import { Input, InputForm } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { usePayrollDetail } from './hook';
import { Filters } from './types';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { month, stringAvatar, year } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import WorkingHourSummary from './section/working-hour-summary';

type PayrollFormFormProps = {
  id?: string;
};

const COLORS = [
  '#9BD0F5', // Salary
  '#1D3B4F', // Employee Benefit
  '#F4A623', // Overtime
  '#68C290', // Additional Earnings
  '#3B8557', // Tax
  '#DC93C6', // BPJS Kesehatan
  '#0C5576', // Jaminan Hari Tua
  '#B7772B', // Jaminan Pensiun
  '#EADFB3', // Jaminan Kecelakaan Kerja
  '#A13C39', // Jaminan Kematian
];

const dataPayroll = [
  { name: 'Salary', value: 1288642850 },
  { name: 'Employee Benefit', value: 234298700 },
  { name: 'Overtime', value: 117149350 },
  { name: 'Additional Earnings', value: 93719480 },
  { name: 'Tax', value: 234298700 },
  { name: 'BPJS Kesehatan', value: 93719480 },
  { name: 'Jaminan Hari Tua', value: 117149350 },
  { name: 'Jaminan Pensiun', value: 70289610 },
  { name: 'Jaminan Kecelakaan Kerja', value: 46859740 },
  { name: 'Jaminan Kematian', value: 46859740 },
];

const currency = (value: number) => 'Rp ' + value.toLocaleString('id-ID');

const total = dataPayroll.reduce((sum, d) => sum + d.value, 0);

export default function PayrollForm({ id }: PayrollFormFormProps) {
  const router = useRouter();

  const {
    attendances,
    pagination,
    setPagination,
    handleGoDetailEmployee,
    setOpenAdd,
    openAdd,
    setOpenDelete,
    openDelete,
    setFilters,
    filters,
    handleAddGroup,
    formData,
    setFormData,
    handleCancel,
    handleNext,
    currentStep,
  } = usePayrollDetail();

  const columns: ColumnDef<Attendance>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex gap-4 items-center min-w-[150px]">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`${row.original.avatar}`} />
            <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
              {stringAvatar(row.original.name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">
              {row.original.name}
            </span>
            <span className="text-text-secondary">
              {row.original.id_number}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'working_hour',
      header: 'Working Hour',
      size: 200,
      cell: ({ row }) => {
        const att = row.original.latest_attendance;
        if (!att) return '-';

        return (
          <div className="flex flex-col">
            <span>22 Days</span>
            <span className="text-primary text-xs">
              {att.duration || '-'}{' '}
              <span className="text-muted-foreground">Hours</span>
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'send_payslip',
      header: 'Send Payslip',
      size: 200,
      cell: ({ row }) => row.original.name || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 160,
      cell: ({ row }) => {
        const status = row.original.latest_attendance?.status_label;
        const { variant, className, label } = getStatusAttendance(status);
        if (!row.original.latest_attendance?.status_label) return '-';

        return (
          <Badge variant={variant} className={className}>
            {label}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'menu',
      header: '',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis className="text-grayscale-30" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <button onClick={() => {}} className="flex gap-2">
                  <Eye />
                  Payruns Details
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/payroll/${row.original.id}/edit`}
                  className="flex gap-2 justify-between items-center"
                >
                  <Edit3 />
                  Edit Payruns
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <button
                  onClick={() => {
                    setOpenDelete(true);
                  }}
                  className="flex gap-2"
                >
                  <Trash />
                  Delete Payruns
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const form = useForm<Filters>({
    defaultValues: {
      search: '',
      date: '',
    },
  });

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 md:px-[40px] px-6">
      <div className="flex flex-col justify-between gap-6 mt-5">
        <div className="grid grid-cols-2 gap-3 space-y-2 mb-4 w-full sm:w-md">
          <div className="col-span-2">
            <div className="text-sm text-gray-500">Payment Period</div>
            <div className="grid grid-cols-2 gap-3 space-y-2">
              <div className="col-span-1">
                <Select
                  onValueChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      period_month: Number(e),
                    }));
                  }}
                  value={String(formData.period_month)}
                  defaultValue={String(
                    formData.period_month ?? new Date().getMonth(),
                  )}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {month.map((item, i) => (
                      <SelectItem value={String(item.id)} key={i}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                <Select
                  onValueChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      period_year: Number(e),
                    }));
                  }}
                  value={String(formData.period_year)}
                  defaultValue={String(
                    formData.period_year ?? new Date().getFullYear(),
                  )}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {year.map((item, i) => (
                      <SelectItem value={String(item.id)} key={i}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-3 space-y-2">
              <div className="col-span-1">
                <div className="text-sm text-gray-500">Send Payslip Date</div>
                <Input
                  type="date"
                  value={formData.send_payslip_at}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      send_payslip_at: new Date(e.target.value).toDateString(),
                    }));
                  }}
                />
              </div>
              <div className="col-span-1">
                <div className="text-sm text-gray-500">
                  Send Payslip Automatically
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-600">No</span>
                  <Switch
                    checked={formData.auto_send_payslip}
                    onCheckedChange={() => {
                      setFormData((prev) => ({
                        ...prev,
                        auto_send_payslip: !formData.auto_send_payslip,
                      }));
                    }}
                  />
                  <span className="text-sm text-blue-600 font-medium">
                    Active
                  </span>
                </div>
                {formData.auto_send_payslip && (
                  <>
                    <Input
                      className="mt-3"
                      type="time"
                      value={new Date(formData.send_payslip_at ?? '').getTime()}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          overtime_date: e.target.value,
                        }));
                      }}
                    />
                    <span className="text-sm text-gray-500 font-medium">
                      Payslip will sent on selected date and time
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-sm text-gray-500">Notes</div>
            <Textarea
              rows={5}
              value={formData.notes}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }));
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="flex md:flex-row flex-col gap-6 w-full">
          <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col p-6 gap-4 max-h-md md:w-[300px] md:h-[280px]">
            <div className="font-semibold mb-3">Completion</div>
            <div className="flex gap-4 items-center">
              <div
                className={`border border-primary flex items-center justify-center h-8 w-8 text-xs rounded-full ${currentStep === 1 ? 'bg-white text-primary' : 'bg-primary text-white'}`}
              >
                1
              </div>
              <div className="text-primary">Gross Pay</div>
            </div>
            <div className="flex gap-4 items-center">
              <div className="border border-primary flex items-center justify-center h-8 w-8 text-xs rounded-full">
                2
              </div>
              <div className="text-primary">Review Payruns</div>
            </div>
          </div>

          <div className="flex flex-col w-full">
            {currentStep === 1 ? (
              <div>
                <h2 className="font-semibold text-xl mb-0">Set Gross Pay</h2>
                <div className="text-sm text-gray-500 font-medium my-2 md:w-xl">
                  Please check employee pay rates, including regular, overtime,
                  and special rate. Ensure the salary amount aligns with the
                  employment contract and company policy.
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-semibold text-xl mb-0">Review Payruns</h2>
                <div className="text-sm text-gray-500 font-medium my-2 md:w-xl">
                  Check the calculated net pay after tax and mandatory
                  deductions according to company policy. Make sure all salary
                  components are accurate before finalizing.
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6 mt-4">
                <div className="flex gap-2">
                  <h2 className="font-semibold text-xl">Total Company Spend</h2>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <PieChart width={300} height={300} className="absolute">
                      <Pie
                        data={dataPayroll}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {dataPayroll.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          currency(value),
                          name,
                        ]}
                      />
                    </PieChart>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                      <p className="text-sm font-semibold">{currency(total)}</p>
                      <p className="text-xs text-muted-foreground">
                        Total Amount
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {dataPayroll.map((d, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[i] }}
                        />
                        <div>
                          <p className="text-sm font-semibold">
                            {currency(d.value)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {d.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6 mt-4">
              <WorkingHourSummary regularHour={320} overtimeHour={100} />
            </div>

            <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6 mt-4">
              <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold text-xl">
                    {currentStep === 1 ? 'Employee Gross Pay List' : 'Nett Pay'}
                  </h2>
                  <Badge className="bg-primary-background text-primary rounded-full">
                    120 Employee
                  </Badge>
                </div>
                <Input
                  className="md:w-sm w-full"
                  placeholder="Search by Employee Name, ID, or Department"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }));
                  }}
                />
              </div>

              <DataTable
                columns={columns}
                data={attendances?.data?.data}
                pagination={attendances?.data}
                paginationState={pagination}
                setPaginationState={setPagination}
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => handleCancel()}
                type="button"
                className="min-w-[100px] bg-white text-primary border-1 border font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleNext()}
                type="button"
                className="min-w-[100px] bg-primary hover:bg-[#14506e] text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
