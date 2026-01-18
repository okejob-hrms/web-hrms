// components/leave-request/index.tsx
'use client';

import * as React from 'react';
import LeaveSummary from './sections/leave-summary';
import LeaveFilters from './sections/leave-filters';
import LeaveModals from './sections/leave-modals';
import { useLeaveRequest } from './hook';
import LeaveTable from './sections/leave-table';

interface AttendanceLeaveRequestProps {
  isEmployee?: boolean;
  hidePannel?: boolean;
}

export default function AttendanceLeaveRequest({
  isEmployee = false,
  hidePannel = false,
}: AttendanceLeaveRequestProps) {
  const leaveRequest = useLeaveRequest(isEmployee);

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6">
      {!hidePannel && (
        <>
          {!isEmployee && <h2 className="font-semibold text-xl">Summary</h2>}

          <LeaveSummary summary={leaveRequest.leaves?.summary} />

          <LeaveFilters
            isEmployee={isEmployee}
            filters={leaveRequest.filters}
            setFilters={leaveRequest.setFilters}
            setPagination={leaveRequest.setPagination}
          />
        </>
      )}
      <LeaveTable
        data={
          isEmployee
            ? leaveRequest.leavesEmployee?.data
            : leaveRequest.leaves?.data.data
        }
        pagination={
          isEmployee
            ? leaveRequest.leavesEmployeePagination
            : leaveRequest.leaves?.data
        }
        paginationState={leaveRequest.pagination}
        setPaginationState={leaveRequest.setPagination}
        loading={leaveRequest.loading}
        onSelectLeave={leaveRequest.selectLeave}
        onOpenModal={leaveRequest.openModal}
        onNavigateAdd={leaveRequest.handleNavigateAddRequestPage}
        isEmployee={isEmployee}
      />

      <LeaveModals
        modalState={leaveRequest.modalState}
        selectedData={leaveRequest.selectedData}
        onCloseModal={leaveRequest.closeModal}
        onApprove={leaveRequest.handleApprove}
        onReject={leaveRequest.handleReject}
        onDelete={leaveRequest.handleDelete}
        getEmployeeData={leaveRequest.getEmployeeData}
        isEmployee={isEmployee}
      />
    </div>
  );
}
