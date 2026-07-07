import React from 'react';
import { useTranslations } from 'next-intl';
import { Filters } from '../types';
import { PaginationState } from '@tanstack/react-table';
import { Separator } from '@/components/ui/separator';
import { InputForm } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  CircleCheckBigIcon,
  CircleXIcon,
  Clock4Icon,
  Search,
} from 'lucide-react';

interface Props {
  isEmployee: boolean;
  filters: Filters;
  setFilters: (filters: Filters | ((prev: Filters) => Filters)) => void;
  setPagination: (
    pagination: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
}

export default function LeaveFilters({
  filters,
  setFilters,
  setPagination,
  isEmployee,
}: Props) {
  const t = useTranslations('attendance');
  const tStatus = useTranslations('status');

  const form = useForm<Filters>({
    defaultValues: {
      search: '',
      date: '',
    },
  });

  const tabs = [
    {
      name: tStatus('waitingForApproval'),
      value: 1,
      icon: <Clock4Icon />,
    },
    {
      name: t('tabApproved'),
      value: 2,
      icon: <CircleCheckBigIcon />,
    },
    {
      name: t('tabRejected'),
      value: 3,
      icon: <CircleXIcon />,
    },
  ];

  return (
    <div className="flex flex-col justify-between gap-4">
      <Tabs
        defaultValue={String(tabs[0].value)}
        className="w-full mx-auto"
        onValueChange={(value) => {
          setFilters((prev) => ({
            ...prev,
            status: Number(value),
          }));
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
      >
        <TabsList className="p-1 w-full bg-secondary-background min-h-12">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={String(tab.value)}
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
      </Tabs>

      <Form {...form}>
        <form className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
          {!isEmployee && (
            <InputForm
              name="search"
              placeholder={t('searchEmployeeNameEmail')}
              icon={<Search className="size-5 text-grayscale-20" />}
              iconPosition="right"
              value={filters.search}
              onChange={(e) => {
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                }));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            />
          )}

          {!isEmployee && <Separator orientation="vertical" />}

          <DatePicker
            className="min-w-[180px]"
            name="date"
            onChange={(e) => {
              setFilters((prev) => ({
                ...prev,
                date: e ? dayjs(e).format('YYYY-MM-DD') : '',
              }));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />
        </form>
      </Form>

      <Separator />
    </div>
  );
}
