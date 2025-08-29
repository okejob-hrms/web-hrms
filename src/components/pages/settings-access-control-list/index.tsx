'use client';

import { Button } from '@/components/ui/button';
import * as React from 'react';
import { useRoleManagement } from '@/components/pages/settings-access-control-list/hook';
import { DataTable } from '@/components/tables/data-table';
import { IRole } from '@/services/settings/types';
import { ColumnDef } from '@tanstack/react-table';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowUp, ArrowDown, ChevronsUpDown, Edit3 } from 'lucide-react';
import { formatDateTime } from '@/lib/helpers';

export default function SettingsAccessControl() {
  const { roles, handleEdit, handleNew } = useRoleManagement();

  const columns: ColumnDef<IRole>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === 'asc' ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === 'desc' ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>Role Name</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === 'asc')}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: 'lastUpdate',
      header: 'Last Update',
      size: 300,
      cell: ({ row }) => {
        const { date, hour } = formatDateTime(row.original.updated_at);
        return (
          <div>
            <span>
              {date} {hour}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end">
            <Button
              variant="link"
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer select-none"
              onClick={() => handleEdit(item.id)}
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const isMobile = useIsMobile();

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex gap-2 items-center flex-wrap">
              <h2 className="font-semibold text-xl">Role</h2>
            </div>
            <Button onClick={() => handleNew()} className="whitespace-nowrap">
              + New Role
            </Button>
          </div>
          <DataTable columns={columns} data={roles} customSize={!isMobile} />
        </div>
      </div>
    </div>
  );
}
