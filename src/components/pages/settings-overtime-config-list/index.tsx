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

// =======================
// Table Columns
// =======================
const columns: ColumnDef<[]>[] = [
  { accessorKey: 'total_hour', header: 'Total Hour', size: 160 },
  { accessorKey: 'workingHours', header: 'Rate', size: 200 },
];

const columnsOvertime: ColumnDef<[]>[] = [
  { accessorKey: 'total_hour', header: 'Day', size: 160 },
  { accessorKey: 'workingHours', header: 'Rate', size: 200 },
];

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

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <h2 className="font-semibold text-xl">Formula & Rate Coefficient</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
            <InfoItem label="Working Hour Divisior" value="173 Hours/Month" />
          </div>

          <h2 className="font-semibold text-xl">Tiering Rules</h2>
          <DataTable columns={columns} data={[]} />

          <h2 className="font-semibold text-xl">Limits & Thresholds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 mb-3">
            <InfoItem label="Max Daily Overtime" value="4 Hours" />
            <InfoItem label="Auto Reject Policy" value="Yes" />
            <InfoItem label="Max Weekly Overtime" value="40 Hours" />
            <InfoItem label="Prorate by Minutes" value="No" />
          </div>

          <h2 className="font-semibold text-xl">
            Holiday & Special Day Overtime
          </h2>
          <div className="grid grid-cols-1 gap-4 mt-2 mb-3">
            <InfoItem
              label="Weekend Overtime Rate"
              value="3 x hourly rate for all hours"
            />
            <InfoItem
              label="Public Holiday Overtime Rate"
              value="4 x hourly rate for all hours"
            />
            <InfoItem label="Special Exceptions" value="" />
          </div>
          <DataTable columns={columnsOvertime} data={[]} />

          <div className="flex mt-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}
