"use client";

import * as React from "react";

import { useBusinessTrips } from "./hook";
import BusinessTripFiltersSection from "./sections/business-trip-filters";
import BusinessTripTable from "./sections/business-trip-table";
import BusinessTripModals from "./sections/business-trip-modals";

export default function BusinessTripList() {
  const {
    rows,
    apiPagination,
    paginationState,
    setPagination,
    filters,
    setFilters,
    loading,

    modalState,
    openModal,
    closeModal,

    selectTrip,

    detail,
    loadingDetail,

    handleApprove,
    handleReject,
    isApproving,
    isRejecting,
  } = useBusinessTrips();

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6">
      <BusinessTripFiltersSection
        filters={filters}
        setFilters={setFilters}
        setPagination={setPagination}
      />

      <BusinessTripTable
        data={rows}
        apiPagination={apiPagination}
        paginationState={paginationState}
        setPaginationState={setPagination}
        loading={loading}
        onSelectTrip={selectTrip}
        onOpenModal={openModal}
      />

      <BusinessTripModals
        modalState={modalState}
        detail={detail}
        loadingDetail={loadingDetail}
        isApproving={isApproving}
        isRejecting={isRejecting}
        onCloseModal={closeModal}
        onOpenModal={openModal}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
