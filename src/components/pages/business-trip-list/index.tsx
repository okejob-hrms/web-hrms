"use client";

import * as React from "react";

import { useBusinessTrips } from "./hook";
import BusinessTripFiltersSection from "./sections/business-trip-filters";
import BusinessTripTable from "./sections/business-trip-table";

export default function BusinessTripList() {
  const {
    rows,
    apiPagination,
    paginationState,
    setPagination,
    filters,
    setFilters,
    loading,
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
      />
    </div>
  );
}
