'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
// import { DataTable } from '@/components/tables/data-table';
// import { ColumnDef } from '@tanstack/react-table';
// import { useIsMobile } from '@/hooks/use-mobile';
import { Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
// import { useCompanyProfile } from './hook';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/components/tables/data-table';
import { useOvertimeConfig } from './hook';
import { Exception, TieringRule } from '@/services/settings/types';
import { Can } from '@/components/auth/can';

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export default function SettingsOvertimeConfig() {
  const router = useRouter();
  const { overtimeData } = useOvertimeConfig();

  const columns: ColumnDef<TieringRule>[] = [
    {
      accessorKey: 'from_hour',
      header: 'Timing Hour',
      size: 200,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1">
            <span className="font-bold">{row.original.from_hour}</span>
            <span className="font-bold">
              {row.original.to_hour && `- ${row.original.to_hour}`}
            </span>
            <span className="text-gray">Hour</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'rate',
      header: 'Rate',
      size: 200,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1">
            <span className="font-bold">{row.original.rate}</span>
            <span className="text-gray">x Hourly Rate</span>
          </div>
        );
      },
    },
  ];

  const columnsOvertime: ColumnDef<Exception>[] = [
    { accessorKey: 'day', header: 'Day', size: 160 },
    {
      accessorKey: 'rate',
      header: 'Rate',
      size: 200,
      cell: ({ row }) => {
        return (
          <div className="flex gap-1">
            <span className="font-bold">{row.original.rate}</span>
            <span className="text-gray">x Hourly Rate</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <h2 className="font-semibold text-xl">Formula & Rate Coefficient</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
            <InfoItem
              label="Working Hour Divisior"
              value={`${overtimeData?.working_hours_divisor} Hours/Month`}
            />
          </div>

          <h2 className="font-semibold text-xl">Tiering Rules</h2>
          <DataTable columns={columns} data={overtimeData?.tiering_rules} />

          <h2 className="font-semibold text-xl">Limits & Thresholds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-3">
            <InfoItem
              label="Max Daily Overtime"
              value={`${overtimeData?.max_daily_hours} Hours`}
            />
            <InfoItem
              label="Auto Reject Policy"
              value={overtimeData?.auto_reject ? 'Yes' : 'No'}
            />
            <InfoItem
              label="Max Weekly Overtime"
              value={`${overtimeData?.max_weekly_hours} Hours`}
            />
            <InfoItem
              label="Prorate by Minutes"
              value={overtimeData?.prorate_by_minutes ? 'Yes' : 'No'}
            />
          </div>

          <h2 className="font-semibold text-xl">
            Holiday & Special Day Overtime
          </h2>
          <div className="grid grid-cols-1 gap-4 mt-2 mb-3">
            <InfoItem
              label="Weekend Overtime Rate"
              value={`${overtimeData?.weekend_rate}x hourly rate for all hours`}
            />
            <InfoItem
              label="Public Holiday Overtime Rate"
              value={`${overtimeData?.public_holiday_rate} x hourly rate for all hours`}
            />
            <InfoItem label="Special Exceptions" value="" />
          </div>
          <DataTable
            columns={columnsOvertime}
            data={overtimeData?.exceptions}
          />

          <div className="flex mt-4">
            <Can permission="time_attendance.overtime_configuration.edit">
              <Button
                variant="outline"
                className="flex flex-row gap-6"
                onClick={() =>
                  router.push(
                    '/settings/time-attendance/overtime-configuration/edit',
                  )
                }
              >
                <Edit3 />
                Edit Overtime Configuration
              </Button>
            </Can>
          </div>
        </div>
      </div>
    </div>
  );
}
