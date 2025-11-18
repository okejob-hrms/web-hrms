/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import StatusCard from "./sections/status-card";
import { useIsMobile } from "@/hooks/use-mobile";
import DataTable from "@/components/tables/data-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { LinearProgress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";

export const SelfAssessmentPeriodDetails = () => {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>Name</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>Submission Status</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "score_avg",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>Score Avg.</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "supervisor",
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const SortIcon = () =>
          isSorted === "asc" ? (
            <ArrowUp className="w-3 h-3" />
          ) : isSorted === "desc" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <ChevronsUpDown className="w-3 h-3 opacity-50" />
          );

        return (
          <div className="flex flex-row gap-2 items-center">
            <span>Supervisor</span>
            <button
              type="button"
              onClick={() => column.toggleSorting(isSorted === "asc")}
              className="flex items-center gap-1"
            >
              <SortIcon />
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "assigned_form",
      header: "Assigned Form",
    },
    {
      accessorKey: "submitted",
      header: "Submitted On",
    },
  ];

  const isMobile = useIsMobile();
  return (
    <div className="font-sans md:px-[125px] px-4 space-y-4">
      <h1 className="font-semibold text-4xl">Self Assessment Q3 2025</h1>
      <h2>Assessment Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">Start Date</span>
          <span className="text-base">-</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">Start Date</span>
          <span className="text-base">-</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatusCard current={80} total={150} statusColor="#18618B" />
        <StatusCard
          label="In Progress"
          current={50}
          total={150}
          statusColor="#80C684"
        />
        <StatusCard
          label="Not Started"
          current={20}
          total={150}
          statusColor="#E57171"
        />
      </div>
      <div className="flex flex-col border border-grayscale-20 shadow-sm rounded-md p-4 gap-4">
        <div className="grid grid-cols-3 gap-2 items-center">
          <div className="col-span-2">
            <h2 className="text-gray-900 font-semibold text-xl">
              Self Assessment Progress
            </h2>
            <span className="text-text-disabled text-sm">
              Completion Progress
            </span>
            <LinearProgress value={66} />
          </div>
          <Input className="" placeholder="Search Employee" />
        </div>
        <DataTable columns={columns} data={[]} customSize={!isMobile} />
      </div>
    </div>
  );
};
