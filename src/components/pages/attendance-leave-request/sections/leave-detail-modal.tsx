'use client';

import React, { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { resolveLocale } from '@/lib/i18n/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { stringAvatar } from '@/lib/utils';
import {
  ILeaveApprover,
  ILeaveResponse,
} from '@/services/employees/leave/types';
import {
  formatDateRange,
  formatDayDifference,
  getStatusOvertime,
} from '@/lib/helpers';
import { StatusBadge } from '@/components/shared/status-badge';
import Link from 'next/link';
import { IEmployeeDetailsResponse } from '@/services/employees/types';
import { getUserLeaveBalance } from '@/services/employees/leave';
import { CircleX, ClockCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  data: ILeaveResponse | undefined;
  getEmployeeData: (user_id: number) => Promise<IEmployeeDetailsResponse>;
  isEmployee: boolean;
}

interface ApproverData {
  approver: ILeaveApprover;
  employeeName: string;
  jobPosition: string;
}

export default function LeaveDetailModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  data,
  getEmployeeData,
  isEmployee,
}: Props) {
  const locale = resolveLocale(useLocale());
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const [approversData, setApproversData] = useState<ApproverData[]>([]);
  const [leaveBalance, setLeaveBalance] = useState('-');
  const [employeeData, setEmployeeData] = useState({
    name: '-',
    job_position: '-',
    job_level: '-',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsedBalanceData = async () => {
      if (!data || !isOpen) return;
      setLoading(true);

      try {
        const usedLeaveBalance = await getUserLeaveBalance(data.user_id);
        if (usedLeaveBalance) {
          setLeaveBalance(
            t('leaveBalanceDays', {
              used: usedLeaveBalance.data.time_off_used,
              available: usedLeaveBalance.data.available_time_off,
            }),
          );
        }
      } catch (err) {
        console.error('Error get user balance: ', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsedBalanceData();
  }, [data, isOpen, getUserLeaveBalance, t]);

  useEffect(() => {
    const fetchData = async () => {
      if (!data || !isOpen) return;

      setLoading(true);
      try {
        const employee = await getEmployeeData(data.user_id);
        if (employee) {
          setEmployeeData({
            name: employee.user?.name || '-',
            job_position: employee.employment?.job_position?.name || '-',
            job_level: employee.employment?.job_level?.name || '-',
          });
        }

        if (data.approvers) {
          const approversWithDetails = await Promise.all(
            data.approvers.map(async (approver) => {
              const employee = await getEmployeeData(approver.user_id);
              return {
                approver,
                employeeName: employee?.user?.name || t('unknownEmployee'),
                jobPosition:
                  employee?.employment?.job_position?.name || t('unknownEmployee'),
              };
            }),
          );
          setApproversData(approversWithDetails);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [data, isOpen, getEmployeeData, t]);

  const renderStatus = (statusData: ILeaveResponse) => {
    const status = statusData.status;
    const { variant, className, key } = getStatusOvertime(status);
    if (!statusData.status) return '-';

    return (
      <StatusBadge statusKey={key} variant={variant} className={className} />
    );
  };

  const renderStatusApprover = (approverData: ILeaveApprover) => {
    const status = approverData.status;
    const { variant, className, key } = getStatusOvertime(status);
    if (!approverData.status) return '-';

    return (
      <StatusBadge statusKey={key} variant={variant} className={className} />
    );
  };

  const handleApprove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApprove();
  };

  const handleReject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReject();
  };

  if (!data) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md min-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle className="text-lg text-left font-semibold text-black mb-2">
            {t('leaveRequestDetails')}
          </AlertDialogTitle>
        </AlertDialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {!isEmployee && (
              <div className="flex flex-col items-center justify-center">
                <Avatar className="h-18 w-18">
                  <AvatarImage src={`${data?.user?.avatar_url}`} />
                  <AvatarFallback className="text-primary-hover bg-primary-background text-base font-medium">
                    {stringAvatar(data?.user?.name ?? '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center">
                  <div className="font-medium">
                    <span>{data?.user?.name}</span>
                    <span>(#{data?.user?.id})</span>
                  </div>
                  <div className="font-medium text-grayscale-100">
                    <span>
                      {employeeData.job_level} | {employeeData.job_position}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 space-y-2 mb-4">
              <div>
                <div className="text-sm text-gray-500">{t('leaveType')}</div>
                <div>{data?.leave_type?.name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{tCommon('duration')}</div>
                <div>
                  <span className="text-base">
                    {formatDateRange(data?.start_date, data?.end_date, locale)}
                  </span>{' '}
                  <span className="text-base text-text-disabled">
                    ({formatDayDifference(data?.start_date, data?.end_date, locale)})
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{tCommon('status')}</div>
                <div>{renderStatus(data)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('usedLeaveBalance')}</div>
                <div>{leaveBalance}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">{t('reason')}</div>
                <div>{data?.reason}</div>
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">{t('attachments')}</div>
                {data?.attachment ? (
                  <Link
                    href={`${process.env.NEXT_PUBLIC_FILE_URL}/${data.attachment}`}
                    className="underline text-primary text-base"
                    target="_blank"
                  >
                    {data.attachment}
                  </Link>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="col-span-2">
                <div className="text-sm text-gray-500">{t('approvers')}</div>
                {approversData.length > 0
                  ? approversData.map((item) => (
                      <div
                        key={item.approver.approver_id}
                        className="flex justify-between py-1"
                      >
                        <div className="flex">
                          <span>{item.employeeName}</span>{' '}
                          <span className="text-text-disabled">
                            ({item.jobPosition})
                          </span>
                        </div>
                        <span>{renderStatusApprover(item.approver)}</span>
                      </div>
                    ))
                  : '-'}
              </div>
            </div>
          </>
        )}

        <AlertDialogFooter className="grid grid-cols-4 justify-between gap-3 w-full">
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 text-primary border-0 justify-start bg-white hover:bg-white rounded-md py-2 font-medium col-span-2"
          >
            {tCommon('cancel')}
          </AlertDialogCancel>
          {!isEmployee && (
            <>
              <AlertDialogCancel
                onClick={handleReject}
                className="flex-1 bg-white text-red-500 hover:text-red-500 hover:opacity-50 rounded-md py-2 font-medium border-red-500 px-4"
              >
                <CircleX />
                {tCommon('reject')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprove}
                className="flex-1 bg-primary text-white rounded-md py-2 font-medium px-5"
              >
                <ClockCheck />
                {t('approveRequest')}
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
