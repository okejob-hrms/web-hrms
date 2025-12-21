'use client';

import * as React from 'react';
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

export const PendingAction = () => {
  const searchParams = useSearchParams();
  const overview = searchParams.get('overview');

  const [loading, setLoading] = React.useState(false);

  const pannel = [
    { title: 'Active Offboarding', value: 884 },
    { title: 'Pending Leave Approvals', value: 10 },
    { title: 'Employees On Leave Today', value: 100 },
    { title: 'Pending Overtime Approval', value: 521 },
    { title: 'Pending Payslip Request Approval', value: 940 },
  ];

  const content = React.useMemo(() => {
    switch (overview) {
      case 'attendance':
        return <AttendanceTrackerList hidePannel relativeStatus="0" />;
      case 'offboarding-active':
        return <EmployeeOffboardingList />;
      case 'offboarding-waiting':
        return <EmployeeOffboardingList />;
      case 'leave':
        return <AttendanceLeaveRequest hidePannel />;
      case 'overtime':
        return <OvertimeTrackerList hidePannel />;
      case 'payslip':
        return <PayrollRequest />;
      default:
        return <EmployeeOffboardingList />;
    }
  }, [overview]);

  return (
    <div className="font-sans min-h-screen flex flex-col py-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pannel.map((item, id) => (
          <DashboardInfo key={id} title={item.title} value={item.value} />
        ))}
      </div>

      <SidebarProvider className="mx-auto w-full md:py-10 flex flex-col md:flex-row md:gap-4">
        <SidebarTrigger className="md:hidden" />
        <AppSidebar title="Pending Action" menuItems={menus['dashboard']} />

        <main className="w-full px-2 md:px-0 py-3 md:py-0 -px-6">
          {loading ? <AppSkeleton /> : content}
        </main>
      </SidebarProvider>
    </div>
  );
};
