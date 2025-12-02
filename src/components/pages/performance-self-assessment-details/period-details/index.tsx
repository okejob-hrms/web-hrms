/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import StatusCard from "./sections/status-card";
import { useIsMobile } from "@/hooks/use-mobile";
import DataTable from "@/components/tables/data-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Edit,
  Ellipsis,
  Eye,
  Trash,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { LinearProgress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useSelfAssessmentPeriodDetails } from "./hook";
import AppSkeleton from "@/components/partials/app-skeleton";
import { IEmployeeAssessment } from "@/services/employees/self-assessment/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusEmployeeAssessment } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const SelfAssessmentPeriodDetails = () => {
  const {
    assessmentDetails,
    isLoading,
    isError,
    handleViewEmployee,
    handleEdit,
  } = useSelfAssessmentPeriodDetails();

  const [searchQuery, setSearchQuery] = React.useState("");

  const columns: ColumnDef<IEmployeeAssessment>[] = [
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
      accessorKey: "submission_status",
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
      cell: ({ row }) => {
        const status = getStatusEmployeeAssessment(
          row.original.submission_status,
        );
        return (
          <Badge variant={status.variant} className={status.className}>
            <div
              className={cn(status.circleClassName, "w-2 h-2 rounded-full")}
            />{" "}
            {status.label}
          </Badge>
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
      cell: ({ row }) => row.original.score,
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
      cell: ({ row }) => row.original.supervisor,
    },
    {
      accessorKey: "form_name",
      header: "Assigned Form",
      cell: ({ row }) => row.original.form_name,
    },
    {
      accessorKey: "submitted_at",
      header: "Submitted On",
      cell: ({ row }) => row.original.submitted_at,
    },
    {
      accessorKey: "menu",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-1"
            >
              <Ellipsis className="text-grayscale-30" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="flex gap-2 w-full text-left text-primary"
                onClick={() => {
                  handleViewEmployee(row.original.id);
                }}
              >
                <Eye className="w-4 h-4 text-primary" /> Details
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="flex gap-2 w-full text-left text-error"
                onClick={() => {
                  // handleDelete(row.original.id);
                }}
              >
                <Trash className="w-4 h-4 text-error" /> Delete
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const isMobile = useIsMobile();

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (isError || !assessmentDetails) {
    return <div>Assessment not found</div>;
  }

  const { assessment, summary, employees } = assessmentDetails;

  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    return employees.filter((employee) => {
      return (
        employee.name?.toLowerCase().includes(lowerCaseQuery) ||
        employee.supervisor?.toLowerCase().includes(lowerCaseQuery) ||
        employee.form_name?.toLowerCase().includes(lowerCaseQuery)
      );
    });
  }, [employees, searchQuery]);

  return (
    <div className="font-sans md:px-[125px] px-4 space-y-4">
      <div className="flex gap-2 items-center">
        <h1 className="font-semibold text-4xl">
          Self Assessment {assessment.assessment_period} {assessment.year}
        </h1>
        <Button type="button" variant="ghost" onClick={handleEdit}>
          <Edit className="w-4 h-4 text-primary" />
        </Button>
      </div>
      <h2>Assessment Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">Start Date</span>
          <span className="text-base">{assessment.start_date}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-text-disabled text-sm">End Date</span>
          <span className="text-base">{assessment.end_date}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatusCard
          label="Completed"
          current={summary.completed}
          total={summary.total}
          statusColor="#18618B"
        />
        <StatusCard
          label="In Progress"
          current={summary.in_progress}
          total={summary.total}
          statusColor="#80C684"
        />
        <StatusCard
          label="Not Started"
          current={summary.not_started}
          total={summary.total}
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
            <LinearProgress value={summary.progress} />
          </div>
          <Input
            className=""
            placeholder="Search Employee"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DataTable
          columns={columns}
          data={filteredEmployees}
          customSize={!isMobile}
        />
      </div>
    </div>
  );
};
