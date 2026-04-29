"use client";

import * as React from "react";
import {
  CircleCheckBigIcon,
  CircleXIcon,
  Clock4Icon,
  Plus,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { useEssBusinessTrips } from "./hook";
import EssBusinessTripTable from "./sections/ess-business-trip-table";
import EssBusinessTripDetailModal from "./sections/ess-business-trip-detail-modal";
import EssBusinessTripAddModal from "./sections/ess-business-trip-add-modal";
import EssBusinessTripCancelModal from "./sections/ess-business-trip-cancel-modal";

const statusTabs = [
  { name: "All", value: "all", icon: <Clock4Icon /> },
  { name: "Waiting", value: 0, icon: <Clock4Icon /> },
  { name: "Approved", value: 1, icon: <CircleCheckBigIcon /> },
  { name: "Rejected", value: 2, icon: <CircleXIcon /> },
  { name: "Cancelled", value: 3, icon: <XCircle /> },
];

export default function EssBusinessTripList() {
  const {
    rows,
    apiPagination,
    paginationState,
    setPagination,
    loading,
    statusFilter,
    setStatusFilter,
    dateFilters,
    setDateFilters,

    modalState,
    openModal,
    closeModal,

    selectTrip,

    detail,
    loadingDetail,

    handleCreate,
    handleCancel,
    isCreating,
    isCancelling,
  } = useEssBusinessTrips();

  return (
    <div className="font-sans min-h-screen flex flex-col space-y-6 px-6 md:px-12">
      <div className="flex md:flex-row flex-col md:items-center items-start justify-between gap-4">
        <h2 className="font-semibold text-xl">My Business Trip</h2>
        <Button onClick={() => openModal("add")}>
          <Plus className="w-4 h-4" /> New Business Trip Request
        </Button>
      </div>

      <Tabs
        value={statusFilter === undefined ? "all" : String(statusFilter)}
        className="w-full mx-auto"
        onValueChange={(value) => {
          const status = value === "all" ? undefined : Number(value);
          setStatusFilter(status);
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
      >
        <TabsList className="p-1 w-full bg-secondary-background min-h-12">
          {statusTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={String(tab.value)}
              className={cn(
                "px-2.5 sm:px-3 text-secondary-hover",
                "data-[state=active]:bg-secondary data-[state=active]:text-white",
              )}
            >
              <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                {tab.icon} {tab.name}
              </code>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-text-secondary">Start Date</span>
          <Input
            type="date"
            value={dateFilters.start_date}
            onChange={(e) => {
              setDateFilters((prev) => ({
                ...prev,
                start_date: e.target.value,
              }));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm text-text-secondary">End Date</span>
          <Input
            type="date"
            value={dateFilters.end_date}
            onChange={(e) => {
              setDateFilters((prev) => ({
                ...prev,
                end_date: e.target.value,
              }));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />
        </div>
      </div>

      <EssBusinessTripTable
        data={rows}
        apiPagination={apiPagination}
        paginationState={paginationState}
        setPaginationState={setPagination}
        loading={loading}
        onSelectTrip={selectTrip}
        onOpenModal={openModal}
      />

      <EssBusinessTripDetailModal
        isOpen={modalState.detail}
        onClose={() => closeModal("detail")}
        data={detail}
        loading={loadingDetail}
        onCancel={() => {
          closeModal("detail");
          openModal("cancel");
        }}
      />

      <EssBusinessTripAddModal
        isOpen={modalState.add}
        onClose={() => closeModal("add")}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      <EssBusinessTripCancelModal
        isOpen={modalState.cancel}
        onClose={() => closeModal("cancel")}
        onConfirm={handleCancel}
        isSubmitting={isCancelling}
      />
    </div>
  );
}
