'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDashboardAnalytics } from '../../hooks/attendance';
import { Skeleton } from '@/components/ui/skeleton';
import DataTable from '@/components/tables/data-table';
import { Input } from '@/components/ui/input';
import { AdditionalListDetailData } from '@/services/dashboard/types';
import { ColumnDef } from '@tanstack/react-table';
import { snakeToTitleCase } from '@/lib/helpers';

interface AdditionalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdditionalModal({
  open,
  onOpenChange,
}: AdditionalModalProps) {
  const {
    additionalStatDetail,
    additionalStatDetailLoading,
    dataPaginationAdditionalDetail,
    typeAdditional,
    paginationAdd,
    setPaginationAdd,
    searchAdd,
    setSearchAdd,
  } = useDashboardAnalytics();

  const columns: ColumnDef<AdditionalListDetailData>[] = [
    {
      accessorKey: 'branch_name',
      header: 'Branch',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'total',
      header: 'Total',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen sm:max-w-7xl p-6 rounded-2xl bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{snakeToTitleCase(typeAdditional)}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-between gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Input
                type="text"
                className="w-full"
                value={searchAdd}
                placeholder="Search employee name"
                onChange={(e) => {
                  setSearchAdd(e.target.value);
                }}
              />
            </div>
          </div>

          {additionalStatDetailLoading ? (
            <div className="flex flex-col gap-4 items-center w-full">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-30 w-full" />
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={additionalStatDetail?.data}
              pagination={dataPaginationAdditionalDetail}
              paginationState={paginationAdd}
              setPaginationState={setPaginationAdd}
            />
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="mt-6 flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
