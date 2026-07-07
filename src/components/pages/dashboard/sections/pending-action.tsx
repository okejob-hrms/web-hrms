'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import DashboardInfo from '@/components/ui/dashboard-info';
import { AppSidebar } from '@/components/partials/app-sidebar';
import { menus } from '@/lib/menu';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSkeleton from '@/components/partials/app-skeleton';
import { useSearchParams } from 'next/navigation';
import { AttendanceTrackerList } from '../../attendance-tracker-list';
import EmployeeOffboardingList from '../../offboarding';
import AttendanceLeaveRequest from '../../attendance-leave-request';
import OvertimeTrackerList from '../../overtime-tracker-list';
import { PayrollRequest } from '../../payroll-request';
import { useDashboardPending } from '../hooks/pending';
import { Skeleton } from '@/components/ui/skeleton';

export const PendingAction = () => {
  const searchParams = useSearchParams();
  const overview = searchParams.get('overview');
  const { pendingStat, pendingStatLoading } = useDashboardPending();
  const t = useTranslations('dashboard');

  const pannel = React.useMemo(
    () => [
      {
        title: t('pendingActiveOffboarding'),
        value: pendingStat?.data.active_offboarding ?? 0,
      },
      {
        title: t('pendingLeaveApprovals'),
        value: pendingStat?.data.pending_leave ?? 0,
      },
      {
        title: t('pendingEmployeesOnLeaveToday'),
        value: pendingStat?.data.employee_on_leave_today ?? 0,
      },
      {
        title: t('pendingOvertimeApproval'),
        value: pendingStat?.data.pending_overtime ?? 0,
      },
      {
        title: t('pendingPayslipRequestApproval'),
        value: pendingStat?.data.pending_payslip ?? 0,
      },
    ],
    [pendingStat, t],
  );

  const content = React.useMemo(() => {
    switch (overview) {
      case 'attendance':
        return <AttendanceTrackerList hidePannel relativeStatus="0" />;
      case 'offboarding-active':
        return <EmployeeOffboardingList hidePannel status={2} />;
      case 'offboarding-waiting':
        return <EmployeeOffboardingList hidePannel status={1} />;
      case 'leave':
        return <AttendanceLeaveRequest hidePannel />;
      case 'overtime':
        return <OvertimeTrackerList hidePannel />;
      case 'payslip':
        return <PayrollRequest />;
      default:
        return <EmployeeOffboardingList hidePannel status={2} />;
    }
  }, [overview]);

  return (
    <div className="font-sans min-h-screen flex flex-col py-6">
      {pendingStatLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pannel.map((item, id) => (
            <DashboardInfo key={id} title={item.title} value={item.value} />
          ))}
        </div>
      )}

      <SidebarProvider className="mx-auto w-full md:py-10 flex flex-col md:flex-row md:gap-4">
        <SidebarTrigger className="md:hidden" />
        <AppSidebar title={t('pendingAction')} menuItems={menus['dashboard']} />

        <main className="w-full px-2 md:px-0 py-3 md:py-0 -px-6">
          {pendingStatLoading ? <AppSkeleton /> : content}
        </main>
      </SidebarProvider>
    </div>
  );
};
