'use client';

import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { getStatusOvertime } from '@/lib/helpers';
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
            header: 'Name',
            cell: ({ row }: CellContext<OvertimeListItem, unknown>) => (
              <div className="flex gap-4 items-center min-w-[150px]">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`${row.original.employee?.avatar_url}`} />
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
            ),
          },
        ]
      : []),

    {
      accessorKey: 'overtime_date',
      header: 'Overtime Date',
      size: 200,
      cell: ({ row }) =>
        dayjs(row.original.overtime_date).format('MMMM D, YYYY') || '-',
    },

    {
      accessorKey: 'request_date',
      header: 'Request Date',
      size: 200,
      cell: ({ row }) =>
        row.original.request_date
          ? dayjs(row.original.request_date).format('MMMM D, YYYY')
          : '-',
    },

    {
      accessorKey: 'duration',
      header: 'Duration',
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
      header: 'Notes',
      size: 200,
      cell: ({ row }) => row.original.notes || '-',
    },

    {
      accessorKey: 'status',
      header: 'Status',
      size: 160,
      cell: ({ row }) => {
        const status = row.original.status;
        const { variant, className, label } = getStatusOvertime(status);
        if (!row.original.status) return '-';

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
                Overtime Request Details
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
                        Approve Request
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onSelect={() => {
                          setOpenReject(true);
                          setSelectedId(String(row.original?.id));
                          setSelectedData(row.original);
                        }}
                      >
                        <XCircle className="mr-2" />
                        Reject Request
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
                    Edit Overtime Request
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
                  Delete Request
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

  const tabs = [
    {
      name: 'Waiting for approval',
      value: 1,
      icon: <Clock4Icon />,
    },
    {
      name: 'Approved',
      value: 2,
      icon: <ClockArrowUpIcon />,
    },
    {
      name: 'Rejected',
      value: 3,
      icon: <ClockAlertIcon />,
    },
  ];

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6">
      {!hidePannel && (
        <>
          {!isEmployee && <h2 className="font-semibold text-xl">Summary</h2>}
          {!isEmployee && (
            <div className="grid xl:grid-cols-4 grid-cols-1 gap-6">
              <InfoList
                title="New Overtime Request"
                compare="vs"
                time="yesterday"
                value={attendances?.summary.new_requests.today}
              />
              <InfoList
                title="Pending Overtime Request"
                compare=""
                time=""
                value={attendances?.summary.pending}
              />
              <InfoList
                title="Approved Overtime Request"
                compare=""
                time=""
                value={attendances?.summary.approved}
              />
              <InfoList
                title="Rejected Overtime Request"
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
              placeholder="Search by Employee Name or Email"
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
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
            <h2 className="font-semibold text-xl">Overtime Request</h2>
            {isEmployee && (
              <Button onClick={() => setOpenAdd(true)}>
                <Plus /> New Overtime Request
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
