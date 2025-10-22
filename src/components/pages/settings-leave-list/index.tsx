'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarClock, Plus, TimerResetIcon } from 'lucide-react';
import { useLateDeduction } from './hook';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { RowActions } from '@/components/tables/row-actions';
import { LeaveConfigItem } from '@/services/settings/types';

export default function SettingsLeaveConfiguration() {
  const { handleEditType, handleDeleteType } = useLateDeduction();

  // =======================
  // Table Columns
  // =======================
  const columnsType: ColumnDef<LeaveConfigItem>[] = [
    { accessorKey: 'name', header: 'Leave Name', size: 160 },
    { accessorKey: 'updated_at', header: 'Last Updated', size: 200 },
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <RowActions
              onEdit={() => {
                handleEditType();
              }}
              onDelete={() => {
                handleDeleteType();
              }}
            />
          </div>
        );
      },
    },
  ];

  const LeaveType = () => {
    return (
      <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
        <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
          <h2 className="font-semibold text-xl">Leave Type</h2>
          <Button className="flex flex-row gap-6" onClick={() => {}}>
            <Plus />
            New Leave Type
          </Button>
        </div>

        <DataTable columns={columnsType} data={[]} />
      </div>
    );
  };

  const LeaveBalance = () => {
    return (
      <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
        <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
          <h2 className="font-semibold text-xl">Leave Balance</h2>
          <Button className="flex flex-row gap-6" onClick={() => {}}>
            <Plus />
            New Leave Balance
          </Button>
        </div>

        <DataTable columns={columnsType} data={[]} />
      </div>
    );
  };

  const tabs = [
    {
      name: 'Leave Type',
      value: 'leave-type',
      content: <LeaveType />,
      icon: <CalendarClock />,
    },
    {
      name: 'Leave Balance',
      value: 'leave-balance',
      content: <LeaveBalance />,
      icon: <TimerResetIcon />,
    },
  ];

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <Tabs defaultValue={tabs[0].value} className="w-full mx-auto">
          <TabsList className="p-1 w-full bg-secondary-background min-h-12">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  'px-2.5 sm:px-3 text-secondary-hover',
                  'data-[state=active]:bg-secondary data-[state=active]:text-white',
                )}
              >
                <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                  {tab.icon} {tab.name}
                </code>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
