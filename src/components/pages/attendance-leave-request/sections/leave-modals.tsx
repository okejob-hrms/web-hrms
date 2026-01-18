/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ILeaveResponse } from '@/services/employees/leave/types';
import LeaveDetailModal from './leave-detail-modal';
import LeaveDeleteModal from './delete-modal';
import LeaveRejectModal from './reject-modal';
import LeaveApproveModal from './approve-modal';

interface Props {
  modalState: {
    detail: boolean;
    approve: boolean;
    delete: boolean;
    reject: boolean;
    edit: boolean;
  };
  selectedData: ILeaveResponse | undefined;
  onCloseModal: (
    modal: 'reject' | 'approve' | 'delete' | 'detail' | 'edit',
  ) => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  getEmployeeData: (user_id: number) => Promise<any>;
  isEmployee: boolean;
}

export default function LeaveModals({
  modalState,
  selectedData,
  onCloseModal,
  onApprove,
  onReject,
  onDelete,
  getEmployeeData,
  isEmployee,
}: Props) {
  return (
    <>
      <LeaveDetailModal
        isOpen={modalState.detail}
        onClose={() => onCloseModal('detail')}
        onApprove={onApprove}
        onReject={onReject}
        data={selectedData}
        getEmployeeData={getEmployeeData}
        isEmployee={isEmployee}
      />

      <LeaveApproveModal
        isOpen={modalState.approve}
        onClose={() => onCloseModal('approve')}
        onApprove={onApprove}
      />

      <LeaveRejectModal
        isOpen={modalState.reject}
        onClose={() => onCloseModal('reject')}
        onReject={onReject}
      />

      <LeaveDeleteModal
        isOpen={modalState.delete}
        onClose={() => onCloseModal('delete')}
        onDelete={onDelete}
      />
    </>
  );
}
