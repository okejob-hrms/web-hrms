'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/tables/data-table';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Separator } from '@/components/ui/separator';
import { Filters } from './types';
import InfoList from '@/components/ui/info-list';
import { useOvertime } from './hook';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, stringAvatar } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock4Icon,
  ClockAlertIcon,
  ClockArrowUpIcon,
  Edit3,
  Ellipsis,
  Eye,
  Plus,
  Search,
  Trash,
  XCircle,
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { getPublicFileUrl, getStatusOvertime } from '@/lib/helpers';
import OvertimeApproveModal from './sections/approve-modal';
import OvertimeRejectModal from './sections/reject-modal';
import OvertimeDeleteModal from './sections/delete-modal';
import { InputForm } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { DatePicker } from '@/components/ui/date-picker';
import dayjs from 'dayjs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  OvertimeListItem,
  RequestOvertime,
  RequestOvertimeStatus,
} from '@/services/overtime/types';
import OvertimeDetailModal from './sections/detail-modal';
import OvertimeEditModal from './sections/edit-modal';
import OvertimeAddModal from './sections/add-modal';
import { Button } from '@/components/ui/button';

interface OvertimeTrackerListProps {
  hidePannel?: boolean;
  isEmployee?: boolean;
}

export default function OvertimeTrackerList({
  hidePannel = false,
  isEmployee = false,
}: OvertimeTrackerListProps) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const tStatus = useTranslations('status');
  const {
    attendances,
    pagination,
    setPagination,
    setSelectedData,
    openDetail,
    setOpenDetail,
    setSelectedId,
    handleApprove,
    handleReject,
    handleDelete,
    setOpenApprove,
    openApprove,
    setOpenReject,
    openReject,
    setOpenDelete,
    openDelete,
    setFilters,
    filters,
    setOpenEdit,
    openEdit,
    handleEdit,
    openAdd,
    setOpenAdd,
    overtimeDataEmployee,
    handleAdd,
  } = useOvertime(isEmployee);

  const [detail, setDetail] = React.useState<OvertimeListItem>();
  const [formData, setFormData] = React.useState<RequestOvertime>({
    user_id: 0,
    overtime_date: '',
    request_date: '',
    start_time: '',
    end_time: '',
    notes: '',
  });

  React.useEffect(() => {
    setFormData({
      user_id: detail?.employee?.id ?? 0,
      overtime_date: dayjs(detail?.overtime_date).format('YYYY-MM-DD'),
      request_date: dayjs(detail?.request_date).format('YYYY-MM-DD'),
      start_time: detail?.start_time ?? '00:00',
      end_time: detail?.end_time ?? '00:00',
      notes: detail?.notes ?? '',
    });
  }, [detail]);
  const columns: ColumnDef<OvertimeListItem>[] = [
    ...(!isEmployee
      ? [
          {
            accessorKey: 'employee.name',
            header: tCommon('name'),
            cell: ({ row }: CellContext<OvertimeListItem, unknown>) => {
              const avatarSrc = getPublicFileUrl(
                row.original.employee?.avatar_url ??
                  row.original.employee?.profile?.photo_profile,
              );

              return (
              <div className="flex gap-4 items-center min-w-[150px]">
                <Avatar className="h-10 w-10">
                  {avatarSrc ? <AvatarImage src={avatarSrc} /> : null}
                  <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                    {stringAvatar(row.original.employee?.name ?? '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-sm">
                    {row.original.employee?.name}
                  </span>
                  <span className="text-text-secondary">
                    #{row.original.employee?.id}
                  </span>
                </div>
              </div>
              );
            },
          },
        ]
      : []),

    {
      accessorKey: 'overtime_date',
      header: t('overtimeDate'),
      size: 200,
      cell: ({ row }) =>
        dayjs(row.original.overtime_date).format('MMMM D, YYYY') || '-',
    },

    {
      accessorKey: 'request_date',
      header: t('requestDate'),
      size: 200,
      cell: ({ row }) =>
        row.original.request_date
          ? dayjs(row.original.request_date).format('MMMM D, YYYY')
          : '-',
    },

    {
      accessorKey: 'duration',
      header: tCommon('duration'),
      cell: ({ row }) => {
        const att = row.original;
        if (!att) return '-';

        return (
          <div className="flex flex-col w-max-2xl">
            <span className="text-muted-foreground text-xs">
              {att.duration + 'm' || '-'}
            </span>
            <span className="text-primary">
              {att.start_time || '-'} — {att.end_time || '-'}
            </span>
          </div>
        );
      },
    },

    {
      accessorKey: 'notes',
      header: tCommon('notes'),
      size: 200,
      cell: ({ row }) => row.original.notes || '-',
    },

    {
      accessorKey: 'status',
      header: tCommon('status'),
      size: 160,
      cell: ({ row }) => {
        const status = row.original.status;
        const { variant, className, key } = getStatusOvertime(status);
        if (!row.original.status) return '-';

        return (
          <StatusBadge statusKey={key} variant={variant} className={className} />
        );
      },
    },

    {
      accessorKey: 'menu',
      header: '',
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Ellipsis className="text-grayscale-30" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => {
                  setSelectedId(String(row.original.id));
                  setDetail(row.original);
                  setSelectedData(row.original);
                  setOpenDetail(true);
                }}
              >
                <Eye className="mr-2" />
                {t('overtimeDetails')}
              </DropdownMenuItem>

              {row.original.status === 1 && (
                <>
                  {!isEmployee && (
                    <>
                      <DropdownMenuItem
                        onSelect={() => {
                          setOpenApprove(true);
                          setSelectedId(String(row.original?.id));
                          setSelectedData(row.original);
                        }}
                      >
                        <Clock4Icon className="mr-2" />
                        {t('approveRequest')}
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onSelect={() => {
                          setOpenReject(true);
                          setSelectedId(String(row.original?.id));
                          setSelectedData(row.original);
                        }}
                      >
                        <XCircle className="mr-2" />
                        {t('rejectRequest')}
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem
                    onSelect={() => {
                      setOpenEdit(true);
                      setSelectedId(String(row.original?.id));
                      setSelectedData(row.original);
                      setDetail(row.original);
                    }}
                  >
                    <Edit3 className="mr-2" />
                    {t('editOvertime')}
                  </DropdownMenuItem>
                </>
              )}

              {!isEmployee && (
                <DropdownMenuItem
                  onSelect={() => {
                    setOpenDelete(true);
                    setSelectedId(String(row.original?.id));
                  }}
                >
                  <Trash className="mr-2" />
                  {t('deleteRequest')}
                </DropdownMenuItem>
              )}
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

  const tabs = React.useMemo(
    () => [
      {
        name: t('waitingForApproval'),
        value: 1,
        icon: <Clock4Icon />,
      },
      {
        name: tStatus('approved'),
        value: 2,
        icon: <ClockArrowUpIcon />,
      },
      {
        name: tStatus('rejected'),
        value: 3,
        icon: <ClockAlertIcon />,
      },
    ],
    [t, tStatus],
  );

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6">
      {!hidePannel && (
        <>
          {!isEmployee && <h2 className="font-semibold text-xl">{tCommon('summary')}</h2>}
          {!isEmployee && (
            <div className="grid xl:grid-cols-4 grid-cols-1 gap-6">
              <InfoList
                title={t('newOvertimeRequest')}
                compare={tCommon('vs')}
                time={tCommon('yesterday')}
                value={attendances?.summary.new_requests.today}
              />
              <InfoList
                title={t('pendingOvertime')}
                compare=""
                time=""
                value={attendances?.summary.pending}
              />
              <InfoList
                title={t('approvedOvertime')}
                compare=""
                time=""
                value={attendances?.summary.approved}
              />
              <InfoList
                title={t('rejectedOvertime')}
                compare=""
                time=""
                value={attendances?.summary.rejected}
              />
            </div>
          )}
        </>
      )}

      <Tabs
        defaultValue={String(tabs[0].value)}
        className="w-full mx-auto"
        onValueChange={(value) =>
          setFilters((prev) => ({
            ...prev,
            status: Number(value),
          }))
        }
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

      <div className="flex flex-col justify-between gap-6 mt-5">
        <Form {...form}>
          <form className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
            <InputForm
              name="search"
              placeholder={t('searchEmployee')}
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

            <Separator orientation="vertical" />

            <DatePicker
              className="min-w-[180px]"
              name="date"
              value={filters.date || undefined}
              onChange={(e) => {
                const now = dayjs();
                setFilters((prev) => ({
                  ...prev,
                  date: e ? dayjs(e).format('YYYY-MM-DD') : '',
                  // Clear day → restore current-month range hardening
                  start_date: e
                    ? prev.start_date
                    : now.startOf('month').format('YYYY-MM-DD'),
                  end_date: e
                    ? prev.end_date
                    : now.endOf('month').format('YYYY-MM-DD'),
                }));
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              }}
            />
          </form>
        </Form>

        <Separator />
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-semibold text-xl">{t('overtimeRequest')}</h2>
            {isEmployee && (
              <Button onClick={() => setOpenAdd(true)}>
                <Plus /> {t('newOvertimeBtn')}
              </Button>
            )}
          </div>

          <DataTable
            columns={columns}
            data={
              isEmployee
                ? overtimeDataEmployee?.data.data
                : attendances?.data.data
            }
            pagination={attendances?.data}
            paginationState={pagination}
            setPaginationState={setPagination}
          />

          <OvertimeDetailModal
            onUpdate={() => handleApprove()}
            onReject={() => handleReject()}
            isOpen={openDetail}
            setIsOpen={(e) => setOpenDetail(e)}
            data={detail}
          />

          <OvertimeApproveModal
            onUpdate={() => handleApprove()}
            isOpen={openApprove}
            setIsOpen={(e) => setOpenApprove(e)}
          />

          <OvertimeRejectModal
            onUpdate={() => handleReject()}
            isOpen={openReject}
            setIsOpen={(e) => setOpenReject(e)}
          />

          <OvertimeDeleteModal
            onUpdate={() => handleDelete()}
            isOpen={openDelete}
            setIsOpen={(e) => setOpenDelete(e)}
          />

          <OvertimeEditModal
            onUpdate={() => handleEdit(formData)}
            isOpen={openEdit}
            setIsOpen={(e) => setOpenEdit(e)}
            data={detail}
            formData={formData}
            setFormData={setFormData}
            isEmployee={isEmployee}
          />

          <OvertimeAddModal
            onUpdate={() => handleAdd(formData)}
            isOpen={openAdd}
            setIsOpen={(e) => setOpenAdd(e)}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </div>
    </div>
  );
}
