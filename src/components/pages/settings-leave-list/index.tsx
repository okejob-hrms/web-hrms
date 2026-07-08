'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarClock, Plus, TimerResetIcon } from 'lucide-react';
import { useLeaveManagement } from './hook';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { RowActions } from '@/components/tables/row-actions';
import { LeaveBalanceItem, LeaveConfigItem } from '@/services/settings/types';
import LeaveBalanceForm from './section/form-modal';
import { formatDate, getMonthLabel } from '@/lib/formatting';
import { resolveLocale } from '@/lib/i18n/locale';
import LeaveBalanceDelete from './section/delete-modal';
import LeaveTypeDelete from './section/delete-type';

export default function SettingsLeaveConfiguration() {
  const t = useTranslations('settings');
  const tEmployee = useTranslations('employee');
  const tCommon = useTranslations('common');
  const locale = resolveLocale(useLocale());
  const {
    loadingType,
    leaveTypeData,
    handleEditType,
    handleDeleteType,
    handleAddType,
    openDeleteType,
    setOpenDeleteType,
    setSelectedType,

    leaveBalanceData,
    loadingBalance,
    handleDeleteBalance,
    openFormBalance,
    setOpenFormBalance,
    openDeleteBalance,
    setOpenDeleteBalance,
    selectedBalance,
    setSelectedBalance,
  } = useLeaveManagement();

  // =======================
  // Table Columns
  // =======================
  const columnsType: ColumnDef<LeaveConfigItem>[] = [
    { accessorKey: 'name', header: t('leaveName'), size: 160 },
    {
      accessorKey: 'updated_at',
      header: tCommon('lastUpdated'),
      size: 200,
      cell: ({ row }) =>
        row.original.updated_at
          ? formatDate(row.original.updated_at, locale, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : '-',
    },
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
                handleEditType(item.id);
              }}
              onDelete={() => {
                setSelectedType(item);
                setOpenDeleteType(true);
              }}
            />
          </div>
        );
      },
    },
  ];

  const columnsBalance: ColumnDef<LeaveBalanceItem>[] = [
    {
      accessorKey: 'job_level_id',
      header: tEmployee('jobLevel'),
      size: 160,
      cell: ({ row }) => {
        const item = row.original;
        return <div className="flex">{item.job_level.name}</div>;
      },
    },
    { accessorKey: 'balance', header: t('leaveBalance'), size: 160 },
    {
      id: 'reset_period_days',
      header: t('resetPeriod'),
      size: 160,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex">
            {item.reset_period_day}{' '}
            {getMonthLabel(item.reset_period_month, locale)}
          </div>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: tCommon('lastUpdated'),
      size: 200,
      cell: ({ row }) =>
        row.original.updated_at
          ? formatDate(row.original.updated_at, locale, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : '-',
    },
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
                setSelectedBalance(item);
                setOpenFormBalance(true);
              }}
              onDelete={() => {
                setSelectedBalance(item);
                setOpenDeleteBalance(true);
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
          <h2 className="font-semibold text-xl">{t('leaveType')}</h2>
          <Button
            className="flex flex-row gap-6"
            onClick={() => handleAddType()}
          >
            <Plus />
            {t('newLeaveType')}
          </Button>
        </div>

        <DataTable columns={columnsType} data={leaveTypeData?.data} />
      </div>
    );
  };

  const LeaveBalance = () => {
    return (
      <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
        <div className="flex flex-col sm:flex-row sm:gap-4 justify-between">
          <h2 className="font-semibold text-xl">{t('leaveBalance')}</h2>
          <Button
            className="flex flex-row gap-6"
            onClick={() => setOpenFormBalance(true)}
          >
            <Plus />
            {t('newLeaveBalance')}
          </Button>
        </div>

        <DataTable columns={columnsBalance} data={leaveBalanceData?.data} />
      </div>
    );
  };

  const tabs = [
    {
      name: t('leaveType'),
      value: 'leave-type',
      content: <LeaveType />,
      icon: <CalendarClock />,
    },
    {
      name: t('leaveBalance'),
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

        <LeaveBalanceForm
          open={openFormBalance}
          onOpenChange={setOpenFormBalance}
          initialData={selectedBalance}
          handleClose={() => setOpenFormBalance(false)}
          isLoading={loadingBalance}
        />

        <LeaveBalanceDelete
          open={openDeleteBalance}
          onOpenChange={setOpenDeleteBalance}
          onDelete={() => handleDeleteBalance()}
          isLoading={loadingBalance}
        />

        <LeaveTypeDelete
          open={openDeleteType}
          onOpenChange={setOpenDeleteType}
          onDelete={() => handleDeleteType()}
          isLoading={loadingType}
        />
      </div>
    </div>
  );
}
