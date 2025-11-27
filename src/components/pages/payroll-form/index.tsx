'use client';

import * as React from 'react';
import { DataTable } from '@/components/tables/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit3, Send, Clock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import dayjs from 'dayjs';
import { usePayrollDetail } from './hook';
import { formatCurrency, stringAvatar } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import WorkingHourSummary from './section/working-hour-summary';
// import { Skeleton } from '@/components/ui/skeleton';
import { Payslip } from '@/services/payroll/types';
import { usePathname, useRouter } from 'next/navigation';
import PayrunApproveModal from './section/confirm-modal';
import AllowanceModal from './section/allowance-modal';
import WorkHourModal from './section/work-hour-modal';
import AdditionalModal from './section/additional-modal';
import OvertimeModal from './section/overtime-modal';
import PenaltyModal from './section/penalty-modal';
import { PayrunsHistorySheet } from './section/audit-trail';

type PayrollFormFormProps = {
  id?: string;
};

const COLORS = [
  '#9BD0F5', // Salary
  '#1D3B4F', // Employee Benefit
  '#F4A623', // Overtime
  '#68C290', // Additional Earnings
  '#3B8557', // Tax
  '#DC93C6', // BPJS Kesehatan
  '#0C5576', // Jaminan Hari Tua
  '#B7772B', // Jaminan Pensiun
  '#EADFB3', // Jaminan Kecelakaan Kerja
  '#A13C39', // Jaminan Kematian
];

const currency = (value: number) => 'Rp ' + value.toLocaleString('id-ID');

export default function PayrollForm({ id }: PayrollFormFormProps) {
  const {
    employeeList,
    dataPagination,
    pagination,
    setPagination,
    setFilters,
    filters,
    handleCancel,
    handleNext,
    handleBack,
    handleSubmit,
    currentStep,
    getDetail,
    detailData,
    loadingSave,
    setOpenConfirm,
    openConfirm,
    openAllowance,
    setOpenAllowance,
    allowances,
    setAllowances,
    handleSaveAllowance,
    setIdRow,
    openWorkingHour,
    setOpenWorkingHour,
    workingHours,
    setWorkingHours,
    handleSaveWorkingHour,
    openOvertime,
    setOpenOvertime,
    overtimes,
    setOvertimes,
    handleSaveOvertime,
    openAdditional,
    setOpenAdditional,
    additionals,
    setAdditionals,
    handleSaveAdditional,
    openPenalty,
    setOpenPenalty,
    penaltys,
    setPenaltys,
    handleSavePenalty,
    detailDataSpend,
    loadingdetailDataSpend,
    paginationAudit,
    setPaginationAudit,
    auditTrail,
    auditTrailLoading,
    handleDownload,
  } = usePayrollDetail();

  React.useEffect(() => {
    if (id !== undefined && id !== null) {
      getDetail(id);
    }
  }, [id]);

  const router = useRouter();
  const pathname = usePathname();
  const isDetail = !pathname.includes('/edit');
  const [openHistory, setOpenHistory] = React.useState(false);

  const dataPayroll = [
    { name: 'Salary', value: detailDataSpend?.data.net_pay.total },
    { name: 'Allowance', value: detailDataSpend?.data.allowance.total },
    { name: 'Overtime', value: detailDataSpend?.data.overtime.total },
    {
      name: 'Additional Earnings',
      value: detailDataSpend?.data.additional_earning.total,
    },
    { name: 'Deductions', value: detailDataSpend?.data.deduction.total },
    { name: 'Penalties', value: detailDataSpend?.data.penalties.total },

    { name: 'Spend', value: detailDataSpend?.data.spend.total },

    ...(detailDataSpend?.data.deductions_by_name?.map((item) => ({
      name: item.label,
      value: item.total,
    })) || []),
  ];

  const total = detailDataSpend?.data.gross_pay.total;

  const baseColumns: ColumnDef<Payslip>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex gap-4 items-center min-w-[250px]">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`${row.original.employee.name}`} />
            <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
              {stringAvatar(row.original.employee.name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-sm">
              {row.original.employee.name}
            </span>
            <span className="text-text-secondary">
              {row.original.employee.id}
            </span>
          </div>
        </div>
      ),
      meta: {
        className: 'sticky left-0 bg-white z-20 shadow-sm',
      },
    },
    {
      accessorKey: 'working_hour',
      header: 'Working Hour',
      cell: ({ row }) => {
        return (
          <div className="flex gap-2 items-center justify-between min-w-[150px]">
            <div className="space-y-2">
              <div>{row.original.working_days ?? '-'} Days</div>
              <div className="text-primary text-xs">
                {row.original.working_hours ?? '-'}{' '}
                <span className="text-muted-foreground">Hours</span>
              </div>
            </div>
            {currentStep === 1 && !isDetail && (
              <Button
                type="button"
                variant="link"
                className="text-primary"
                onClick={() => {
                  setIdRow(String(row.original.id));
                  setWorkingHours({
                    working_days: row.original.working_days,
                    working_hours: row.original.working_hours,
                  });
                  setOpenWorkingHour(true);
                }}
              >
                <Edit3 />
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'allowance',
      header: 'Allowance',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center justify-between min-w-[150px]">
          <div className="space-y-2">
            <div className="text-gray-400">
              Rp{' '}
              <span className="text-gray-800">
                {formatCurrency(Number(row.original.total_allowances))}
              </span>
            </div>
            <Badge
              variant="default"
              className="bg-primary/10 border-primary text-primary"
            >
              {row.original.allowance.length} Benefit
            </Badge>
          </div>
          {currentStep === 1 && !isDetail && (
            <Button
              type="button"
              variant="link"
              className="text-primary"
              onClick={() => {
                const list = row.original.allowance.map((item) => ({
                  allowance_name: String(item.allowance_name),
                  allowance_value: String(item.allowance_value),
                  allowance_type_id: String(item.allowance_type_id),
                }));
                setIdRow(String(row.original.id));
                setAllowances(list);
                setOpenAllowance(true);
              }}
            >
              <Edit3 />
            </Button>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'overtime',
      header: 'Overtime',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center justify-between min-w-[150px]">
          <div className="space-y-2">
            <div className="text-gray-400">
              Rp{' '}
              <span className="text-gray-800">
                {formatCurrency(Number(row.original.total_overtime))}
              </span>
            </div>
            {/* <div className="text-gray-400 text-xs">
              Overtime:{' '}
              <span className="text-primary">
                {Number(row.original.overtime)}
              </span>{' '}
              Hours
            </div> */}
          </div>
          {currentStep === 1 && !isDetail && (
            <Button
              type="button"
              variant="link"
              className="text-primary"
              onClick={() => {
                setIdRow(String(row.original.id));
                setOvertimes({
                  overtime_amount: row.original.total_overtime,
                });
                setOpenOvertime(true);
              }}
            >
              <Edit3 />
            </Button>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'additional',
      header: 'Additional Earnings',
      cell: ({ row }) => (
        <div className="min-w-[250px]">
          <div className="flex items-center justify-between pr-10">
            <div className="space-y-2">
              <div className="text-gray-400">
                Rp{' '}
                <span className="text-gray-800">
                  {formatCurrency(
                    Number(row.original.total_additional_earnings),
                  )}
                </span>
              </div>
              <Badge
                variant="default"
                className="bg-primary/10 border-primary text-primary"
              >
                {row.original.additional_earning.length} Earnings
              </Badge>
            </div>
            {currentStep === 1 && !isDetail && (
              <Button
                type="button"
                variant="link"
                className="text-primary"
                onClick={() => {
                  const list = row.original.additional_earning.map((item) => ({
                    name: item.name,
                    amount: item.amount,
                  }));
                  setIdRow(String(row.original.id));
                  setAdditionals(list);
                  setOpenAdditional(true);
                }}
              >
                <Edit3 />
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'penalty',
      header: 'Penalty Deduction',
      cell: ({ row }) => (
        <div className="flex gap-2 items-center justify-between min-w-[150px]">
          <div className="text-gray-400">
            - Rp{' '}
            <span className="text-gray-800">
              {formatCurrency(Number(row.original.total_deductions))}
            </span>
          </div>
          {currentStep === 1 && !isDetail && (
            <Button
              type="button"
              variant="link"
              className="text-primary"
              onClick={() => {
                setIdRow(String(row.original.id));
                setPenaltys({
                  penalties_amount: row.original.total_deductions,
                });
                setOpenPenalty(true);
              }}
            >
              <Edit3 />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const uniqueDeductions = Array.from(
    new Map(
      (employeeList?.data.payslips ?? [])
        .flatMap((p) => p.deduction)
        .map((d) => [d.salary_deduction_id, d]),
    ).values(),
  );

  const detailColumns: ColumnDef<Payslip>[] = uniqueDeductions.map((ded) => ({
    id: `deduction-${ded.salary_deduction_id}`,
    header: ded.name,
    accessorFn: (row) => {
      const item = row.deduction.find(
        (d) => d.salary_deduction_id === ded.salary_deduction_id,
      );
      return item?.amount ?? 0;
    },
    cell: ({ row }) => {
      const item = row.original.deduction.find(
        (d) => d.salary_deduction_id === ded.salary_deduction_id,
      );
      return (
        <div className="min-w-[150px] text-gray-800">
          Rp {formatCurrency(item?.amount ?? 0)}
        </div>
      );
    },
  }));

  const payColumns: ColumnDef<Payslip>[] = [
    {
      accessorKey: 'gross_pay',
      header: 'Gross Pay',
      cell: ({ row }) => (
        <div className="min-w-[150px]">
          <span className="text-gray-400">
            Rp{' '}
            <span className="text-gray-800">
              {formatCurrency(Number(row.original.gross_pay))}
            </span>
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'net_pay',
      header: 'Nett Pay',
      size: 200,
      cell: ({ row }) => (
        <div className="min-w-[150px] flex items-center justify-between">
          <div className="text-gray-400">
            Rp{' '}
            <span className="text-gray-800">
              {formatCurrency(Number(row.original.net_pay))}
            </span>
          </div>
          {isDetail && employeeList?.data.payrun.status === 2 && (
            <Button
              type="button"
              variant="link"
              className="text-primary"
              onClick={() =>
                handleDownload(row.original, employeeList.data.payrun)
              }
            >
              <Eye />
            </Button>
          )}
        </div>
      ),
      meta: {
        className: 'sticky right-0 bg-white z-20 shadow-sm',
      },
    },
  ];

  const columns: ColumnDef<Payslip>[] = [
    ...baseColumns,
    ...detailColumns,
    ...payColumns,
  ];

  return (
    <div
      className={
        isDetail
          ? 'max-w-6xl mx-auto px-6'
          : 'font-sans min-h-screen flex flex-col space-y-6 md:px-[40px] px-6'
      }
    >
      <div className="flex flex-col justify-between gap-6 mt-5">
        <div className="grid md:grid-cols-3 gap-3 space-y-2 mb-4 w-full">
          <div className="col-span-1">
            <h2 className="font-semibold text-xl mb-0">Payruns Detail</h2>
          </div>
          <div className="col-span-2">
            <div className="flex justify-end gap-2">
              {isDetail && employeeList?.data.payrun.status !== 2 && (
                <Button
                  onClick={() => router.push(`/payroll/list/${id}/edit`)}
                  type="button"
                  variant="outline"
                  className="min-w-[100px] bg-white text-primary border-1 border font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit3 />
                  Edit Payruns
                </Button>
              )}
              <Button
                onClick={() => setOpenHistory(true)}
                type="button"
                variant="outline"
                className="min-w-[100px] bg-white border-orange-500 border-1 border font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-orange-500"
              >
                <Clock />
                Payruns History
              </Button>
            </div>
          </div>
          <div className="col-span-1">
            <div className="text-sm text-gray-500">Payment Period</div>
            <div className="text-sm font-semibold">
              {detailData?.data?.period_label}
            </div>
          </div>

          <div className="col-span-2">
            <div className="grid grid-cols-2 gap-3 space-y-2">
              <div className="col-span-1">
                <div className="text-sm text-gray-500">Send Payslip Date</div>
                <div className="flex gap-2">
                  <div className="text-sm font-semibold">
                    {dayjs(detailData?.data?.send_payslip_at).format(
                      'MMMM DD, YYYY',
                    ) ?? '-'}
                  </div>
                  <div className="bg-primary/10 border-primary rounded-full px-2 text-xs text-primary flex items-center justify-center gap-2">
                    Automatically Send at 08:00 AM
                  </div>
                </div>
              </div>
            </div>
          </div>

          {detailData?.data?.notes && (
            <div className="col-span-2">
              <div className="text-sm text-gray-500">Notes</div>
              <div className="text-sm font-semibold">
                {detailData?.data?.notes}
              </div>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex md:flex-row flex-col gap-6 w-full">
          {!isDetail && (
            <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col p-6 gap-4 max-h-md md:w-[300px] md:h-[280px]">
              <div className="font-semibold mb-3">Completion</div>
              <div className="flex gap-4 items-center">
                <div
                  className={`border border-primary flex items-center justify-center h-8 w-8 text-xs rounded-full ${currentStep === 1 ? 'bg-white text-primary' : 'bg-primary text-white'}`}
                >
                  1
                </div>
                <div className="text-primary">Gross Pay</div>
              </div>
              <div className="flex gap-4 items-center">
                <div className="border border-primary flex items-center justify-center h-8 w-8 text-xs rounded-full">
                  2
                </div>
                <div className="text-primary">Review Payruns</div>
              </div>
            </div>
          )}

          <div className="flex flex-col w-full">
            {!isDetail && (
              <div>
                {currentStep === 1 ? (
                  <div>
                    <h2 className="font-semibold text-xl mb-0">
                      Set Gross Pay
                    </h2>
                    <div className="text-sm text-gray-500 font-medium my-2 md:w-xl">
                      Please check employee pay rates, including regular,
                      overtime, and special rate. Ensure the salary amount
                      aligns with the employment contract and company policy.
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="font-semibold text-xl mb-0">
                      Review Payruns
                    </h2>
                    <div className="text-sm text-gray-500 font-medium my-2 md:w-xl">
                      Check the calculated net pay after tax and mandatory
                      deductions according to company policy. Make sure all
                      salary components are accurate before finalizing.
                    </div>
                  </div>
                )}
              </div>
            )}

            {(currentStep === 2 || isDetail) && (
              <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6 mt-4">
                <div className="flex gap-2">
                  <h2 className="font-semibold text-xl">Total Company Spend</h2>
                </div>
                {!loadingdetailDataSpend && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                      <PieChart width={300} height={300} className="absolute">
                        <Pie
                          data={dataPayroll}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {dataPayroll.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            currency(value),
                            name,
                          ]}
                        />
                      </PieChart>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-sm font-semibold">
                          {currency(total || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Amount
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                      {dataPayroll.map((d, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[i] }}
                          />
                          <div>
                            <p className="text-sm font-semibold">
                              {currency(d.value || 0)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {d.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* {(currentStep === 2 || isDetail) && (
              <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6 mt-4">
                <WorkingHourSummary regularHour={320} overtimeHour={100} />
              </div>
            )} */}

            <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6 mt-4">
              <div className="flex md:flex-row flex-col justify-between w-full md:items-center items-start gap-4">
                <div className="flex gap-2 items-center">
                  <h2 className="font-semibold text-xl">
                    {currentStep === 1 ? 'Employee Gross Pay List' : 'Nett Pay'}
                  </h2>
                  <Badge className="bg-primary-background text-primary rounded-full">
                    {dataPagination.total} Employee
                  </Badge>
                </div>
                <Input
                  className="md:w-sm w-full"
                  placeholder="Search by Employee Name, ID, or Department"
                  value={filters.search}
                  onChange={(e) => {
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }));
                  }}
                />
              </div>

              <DataTable
                columns={columns}
                data={employeeList?.data.payslips}
                pagination={dataPagination}
                paginationState={pagination}
                setPaginationState={setPagination}
                colLeftFixed
                colRightFixed
              />
            </div>

            {!isDetail && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => handleCancel()}
                  type="button"
                  variant="outline"
                  className="min-w-[100px] bg-white text-primary border-1 border font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </Button>
                {currentStep === 1 ? (
                  <Button
                    onClick={() => {
                      handleNext();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    type="button"
                    className="min-w-[100px] bg-primary hover:bg-primary-800 text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                ) : (
                  <div className="flex gap-6 items-center mt-4">
                    <Button
                      onClick={() => {
                        handleBack();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      type="button"
                      variant="outline"
                      className="min-w-[100px] bg-white text-primary border-1 border font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft />
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setOpenConfirm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      type="button"
                      isLoading={loadingSave}
                      className="min-w-[100px] bg-primary hover:bg-primary-800 text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Finalize Payruns
                    </Button>
                  </div>
                )}
              </div>
            )}

            <PayrunApproveModal
              onUpdate={() => handleSubmit(id || '')}
              isOpen={openConfirm}
              setIsOpen={(e) => setOpenConfirm(e)}
            />

            <AllowanceModal
              open={openAllowance}
              onOpenChange={setOpenAllowance}
              data={allowances || []}
              setData={setAllowances}
              onSave={handleSaveAllowance}
            />

            <WorkHourModal
              open={openWorkingHour}
              onOpenChange={setOpenWorkingHour}
              data={workingHours || []}
              setData={setWorkingHours}
              onSave={handleSaveWorkingHour}
            />

            <OvertimeModal
              open={openOvertime}
              onOpenChange={setOpenOvertime}
              data={overtimes || []}
              setData={setOvertimes}
              onSave={handleSaveOvertime}
            />

            <AdditionalModal
              open={openAdditional}
              onOpenChange={setOpenAdditional}
              data={additionals || []}
              setData={setAdditionals}
              onSave={handleSaveAdditional}
            />

            <PenaltyModal
              open={openPenalty}
              onOpenChange={setOpenPenalty}
              data={penaltys || []}
              setData={setPenaltys}
              onSave={handleSavePenalty}
            />

            <PayrunsHistorySheet
              open={openHistory}
              onOpenChange={setOpenHistory}
              history={auditTrail?.data || []}
              page={paginationAudit}
              setPage={setPaginationAudit}
              loading={auditTrailLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
