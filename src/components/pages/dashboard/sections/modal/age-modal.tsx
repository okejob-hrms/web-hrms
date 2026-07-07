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
import { AgeListData } from '@/services/dashboard/types';
import { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';

interface AgeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardAnalytics: ReturnType<typeof useDashboardAnalytics>;
}

export default function AgeModal({
  open,
  onOpenChange,
  dashboardAnalytics,
}: AgeModalProps) {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const {
    dataListAge,
    loadingListAge,
    dataPaginationAge,
    paginationAge,
    setPaginationAge,
    searchAge,
    setSearchAge,
  } = dashboardAnalytics;

  const columns = React.useMemo<ColumnDef<AgeListData>[]>(
    () => [
      { accessorKey: 'name', header: tCommon('name') },
      { accessorKey: 'position', header: tCommon('position') },
      { accessorKey: 'branch', header: t('branch') },
      { accessorKey: 'date_of_birth', header: t('dob') },
      { accessorKey: 'category', header: t('category') },
    ],
    [t, tCommon],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen sm:max-w-7xl p-6 rounded-2xl bg-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('ageSpreadDetail')}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col justify-between gap-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Input
                type="text"
                className="w-full"
                value={searchAge}
                placeholder={t('searchName')}
                onChange={(e) => {
                  setSearchAge(e.target.value);
                }}
              />
            </div>
          </div>

          {loadingListAge ? (
            <div className="flex flex-col gap-4 items-center w-full">
              <Skeleton className="h-12 w-full" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-30 w-full" />
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={dataListAge?.data}
              pagination={dataPaginationAge}
              paginationState={paginationAge}
              setPaginationState={setPaginationAge}
            />
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-between items-center w-full">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {tCommon('cancel')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
