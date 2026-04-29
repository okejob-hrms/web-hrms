"use client";

import * as React from "react";
import { IBusinessTripResponse } from "@/services/business-trips/types";

import BusinessTripDetailModal from "./business-trip-detail-modal";
import BusinessTripApproveModal from "./business-trip-approve-modal";
import BusinessTripRejectModal from "./business-trip-reject-modal";
import { BusinessTripModalKey } from "../hook";

interface Props {
  modalState: {
    detail: boolean;
    approve: boolean;
    reject: boolean;
  };
  detail?: IBusinessTripResponse;
  loadingDetail?: boolean;
  isApproving?: boolean;
  isRejecting?: boolean;
  onCloseModal: (modal: BusinessTripModalKey) => void;
  onOpenModal: (modal: BusinessTripModalKey) => void;
  onApprove: (note?: string | null) => void;
  onReject: (note?: string | null) => void;
}

export default function BusinessTripModals({
  modalState,
  detail,
  loadingDetail,
  isApproving,
  isRejecting,
  onCloseModal,
  onOpenModal,
  onApprove,
  onReject,
}: Props) {
  return (
    <>
      <BusinessTripDetailModal
        isOpen={modalState.detail}
        onClose={() => onCloseModal("detail")}
        data={detail}
        loading={loadingDetail}
        onApprove={() => {
          onCloseModal("detail");
          onOpenModal("approve");
        }}
        onReject={() => {
          onCloseModal("detail");
          onOpenModal("reject");
        }}
      />

      <BusinessTripApproveModal
        isOpen={modalState.approve}
        onClose={() => onCloseModal("approve")}
        onApprove={onApprove}
        isSubmitting={isApproving}
      />

      <BusinessTripRejectModal
        isOpen={modalState.reject}
        onClose={() => onCloseModal("reject")}
        onReject={onReject}
        isSubmitting={isRejecting}
      />
    </>
  );
}
