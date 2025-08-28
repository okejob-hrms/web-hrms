/* eslint-disable @typescript-eslint/no-explicit-any */
// sections/employee-profile-modal.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  assignEmployeeFormScheme,
  AssignEmployeeFormValues,
  EmployeeNode,
} from "../types";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectForm } from "@/components/ui/select-form";
import { MultiSelect } from "@/components/ui/multi-select";
import { IEmployeeDetailsResponse } from "@/services/employees/types";
import { useQuery } from "@tanstack/react-query";
import { getDepartment } from "@/services/department";
import { getJobLevels } from "@/services/job-levels";
import { getJobPosition } from "@/services/job-position";
import { getTeam } from "@/services/team";
import { getEmployees } from "@/services/employees";

interface EmployeeProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleClose: () => void;
  employeeData: IEmployeeDetailsResponse | null;
  // Add a prop for handling the save action
  handleSave: (data: AssignEmployeeFormValues) => void;
  chartEmployees: EmployeeNode[];
}

// --- Helper component for the Detail View ---
const DetailView = ({
  employeeData,
  chartEmployees,
}: {
  employeeData: IEmployeeDetailsResponse;
  chartEmployees: EmployeeNode[];
}) => {
  const dummyTeams = ["Team Creative", "Team Marketing", "Team Production"];
  const employeeMap = new Map(chartEmployees.map((e) => [e.employeeId, e]));

  // Process the reporting relationships to create the display strings
  const primaryReports = employeeData.reporting_relationships
    .filter((r) => r.relationship_type === "primary")
    .map((r) => {
      const reportEmployee = employeeMap.get(String(r.direct_report_id));
      return reportEmployee
        ? `${reportEmployee.name} (${reportEmployee.title})`
        : "Unknown Employee";
    })
    .join("; ");

  const additionalReports = employeeData.reporting_relationships
    .filter((r) => r.relationship_type !== "primary")
    .map((r) => {
      const reportEmployee = employeeMap.get(String(r.direct_report_id));
      return reportEmployee
        ? `${reportEmployee.name} (${reportEmployee.title})`
        : "Unknown Employee";
    })
    .join("; ");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={employeeData.photo_profile} />
          <AvatarFallback>{employeeData.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{employeeData.user.name}</p>
          <p className="text-xs text-gray-500">
            {employeeData.employment.job_position.name}
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-secondary">Email</label>
          <label className="text-sm text-text-secondary">
            {employeeData.user.email}
          </label>
        </div>
        <div className="flex flex-col gap-2 pr-30">
          <label className="text-sm text-text-secondary">Phone Number</label>
          <label className="text-sm text-text-secondary">
            {employeeData.phone_number}
          </label>
        </div>
      </div>

      {/* Department */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-text-secondary">Department</label>
        <label className="text-sm text-text-secondary">
          {employeeData.employment.department.name}
        </label>
      </div>

      {/* Position */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-text-secondary">Position</label>
        <label className="text-sm text-text-secondary">
          {employeeData.employment.job_position.name}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-text-secondary">Job Level</label>
        <label className="text-sm text-text-secondary">
          {employeeData.employment.job_level.name}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">Primary Direct Report</label>
        <p className="font-medium text-gray-900">{primaryReports || "None"}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">
          Additional Direct Report
        </label>
        <p className="font-medium text-gray-900">
          {additionalReports || "None"}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">Teams</label>
        <div className="flex flex-wrap gap-2">
          {dummyTeams.map((teamName) => (
            <div
              key={teamName}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
            >
              {teamName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Helper component for the Edit Form ---
const EditView = ({
  form,
  employeeData,
}: {
  form: UseFormReturn<AssignEmployeeFormValues>;
  employeeData: IEmployeeDetailsResponse;
}) => {
  const { data: employeesOptionsForm, isLoading: isLoadingEmployees } =
    useQuery({
      queryKey: [
        "employees",
        // watchedDepartmentId,
        // watchedJobPositionId,
        // watchedJobLevelId,
      ],
      queryFn: () => getEmployees({}),
      //   {
      //   department_ids: [Number(watchedDepartmentId)],
      //   job_position_ids: [Number(watchedJobPositionId)],
      //   job_level_ids: [Number(watchedJobLevelId)],
      // }
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      // enabled: !!(
      //   watchedDepartmentId ||
      //   watchedJobPositionId ||
      //   watchedJobLevelId
      // ),
    });
  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    error: departmentsError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartment(),
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: jobLevels,
    isLoading: isJobLevelsLoading,
    error: jobLevelsError,
  } = useQuery({
    queryKey: ["jobLevels"],
    queryFn: getJobLevels,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: positions,
    isLoading: isPositionsLoading,
    error: positionsError,
  } = useQuery({
    queryKey: ["jobPositions"],
    queryFn: getJobPosition,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: teams,
    isLoading: isTeamsLoading,
    error: teamsError,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => getTeam(),
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const employeesOptions = React.useMemo(() => {
    if (employeesOptionsForm?.data?.data) {
      return employeesOptionsForm.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [employeesOptionsForm?.data]);

  const departmentOptions = React.useMemo(() => {
    if (departments?.data?.data) {
      return departments.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [departments?.data]);

  const positionOptions = React.useMemo(() => {
    if (positions?.data) {
      return positions.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [positions?.data]);

  const jobLevelOptions = React.useMemo(() => {
    if (jobLevels?.data) {
      return jobLevels.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [jobLevels?.data]);

  const teamOptions = React.useMemo(() => {
    if (teams?.data?.data) {
      return teams.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [teams?.data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={employeeData.photo_profile} />
          <AvatarFallback>{employeeData.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{employeeData.user.name}</p>
          <p className="text-xs text-gray-500">
            {employeeData.employment.job_position.name}
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-secondary">Email</label>
          <label className="text-sm text-text-secondary">
            {employeeData.user.email}
          </label>
        </div>
        <div className="flex flex-col gap-2 pr-30">
          <label className="text-sm text-text-secondary">Phone Number</label>
          <label className="text-sm text-text-secondary">
            {employeeData.phone_number}
          </label>
        </div>
      </div>
      <FormField
        control={form.control}
        name="department"
        render={({ field }) => (
          <FormItem>
            <label className="text-sm text-text-secondary">
              Department<span className="text-red-500">*</span>
            </label>
            <SelectForm
              options={departmentOptions}
              {...field}
              disabled={isDepartmentsLoading || !!departmentsError}
              required
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="position"
        render={({ field }) => (
          <FormItem>
            <label className="text-sm text-text-secondary">
              Position<span className="text-red-500">*</span>
            </label>
            <SelectForm
              options={positionOptions}
              disabled={isPositionsLoading || !!positionsError}
              required
              {...field}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="jobLevel"
        render={({ field }) => (
          <FormItem>
            <label className="text-sm text-text-secondary">
              Job Level<span className="text-red-500">*</span>
            </label>
            <SelectForm
              options={jobLevelOptions}
              disabled={isJobLevelsLoading || !!jobLevelsError}
              required
              {...field}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="primaryDirectReport"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                Primary Direct Report <span className="text-red-500">*</span>
              </label>
              <MultiSelect
                name="primaryDirectReport"
                options={employeesOptions}
                value={field.value}
                onValueChange={field.onChange}
                maxCount={3}
                variant="inverted"
                disabled={isLoadingEmployees}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="additionalDirectReport"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                Additional Direct Report
              </label>
              <MultiSelect
                name="additionalDirectReport"
                options={employeesOptions}
                value={field.value}
                onValueChange={field.onChange}
                maxCount={3}
                variant="inverted"
                disabled={isLoadingEmployees}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="teams"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Team</label>
              <MultiSelect
                name="teams"
                placeholder="All Teams"
                options={teamOptions}
                value={field.value}
                onValueChange={field.onChange}
                maxCount={3}
                variant="inverted"
                disabled={isTeamsLoading || !!teamsError}
              />
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default function EmployeeProfileModal({
  open,
  onOpenChange,
  handleClose,
  employeeData,
  handleSave,
  chartEmployees,
}: EmployeeProfileModalProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const form = useForm<AssignEmployeeFormValues>({
    resolver: zodResolver(assignEmployeeFormScheme),
    mode: "onChange",
  });

  const onSubmit = (data: AssignEmployeeFormValues) => {
    handleSave(data);
    setIsEditMode(false);
  };

  if (!employeeData) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <div>Loading employee details...</div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isEditMode ? "Edit Employee" : "Employee Details"}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className={cn("overflow-y-auto pr-2 mt-4", "max-h-[500px]")}>
              {isEditMode ? (
                <EditView employeeData={employeeData} form={form} />
              ) : (
                <DetailView
                  employeeData={employeeData}
                  chartEmployees={chartEmployees}
                />
              )}
            </div>
            <AlertDialogFooter className="flex justify-center gap-4 mt-4">
              {isEditMode ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid}
                    className="min-w-[100px]"
                  >
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="min-w-[100px] text-primary"
                  >
                    Close
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.setValue("name", employeeData.user.name);
                      form.setValue(
                        "department",
                        String(employeeData.employment.department_id)
                      );
                      form.setValue(
                        "position",
                        String(employeeData.employment.job_position_id)
                      );
                      form.setValue(
                        "jobLevel",
                        String(employeeData.employment.job_level_id),
                        {
                          shouldValidate: true,
                        }
                      );
                      setIsEditMode(true);
                    }}
                    className="min-w-[100px] "
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </>
              )}
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
