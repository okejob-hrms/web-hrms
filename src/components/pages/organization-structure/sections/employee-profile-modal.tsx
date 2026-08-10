/* eslint-disable @typescript-eslint/no-explicit-any */
// sections/employee-profile-modal.tsx
"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
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
  editEmployeeFormScheme,
  EditEmployeeFormValues,
  EmployeeNode,
} from "../types";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectForm } from "@/components/ui/select-form";
import { MultiSelect } from "@/components/ui/multi-select";
import { useQuery } from "@tanstack/react-query";
import { getDepartment } from "@/services/department";
import { getJobLevels } from "@/services/job-levels";
import { getJobPosition } from "@/services/job-position";
import { getTeam } from "@/services/team";
import { getEmployees } from "@/services/employees";
import { useDebounce } from "@/hooks/use-debounce";
import { ComboboxForm } from "@/components/ui/combobox";

interface EmployeeProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleClose: () => void;
  employeeData: EmployeeNode | null;
  handleSave: (data: EditEmployeeFormValues) => void;
  chartEmployees: EmployeeNode[];
}

const DetailView = ({
  employeeData,
  chartEmployees,
}: {
  employeeData: EmployeeNode;
  chartEmployees: EmployeeNode[];
}) => {
  const employeeMap = new Map(chartEmployees.map((e) => [e.employeeId, e]));

  const primaryReports = employeeData.primary_direct_report
    .map((r) => employeeMap.get(String(r.id)))
    .filter(Boolean);

  const additionalReports = employeeData.secondary_direct_report
    .map((r) => employeeMap.get(String(r.id)))
    .filter(Boolean);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={employeeData.photo_profile} />
          <AvatarFallback>{employeeData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{employeeData.name}</p>
          <p className="text-xs text-gray-500">{employeeData.job_position}</p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-500">Email</label>
          <label className="font-medium text-gray-900">
            {employeeData.email}
          </label>
        </div>
        <div className="flex flex-col gap-2 pr-30">
          <label className="text-sm text-gray-500">Phone Number</label>
          <label className="font-medium text-gray-900">
            {employeeData.phone_number}
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">Department</label>
        <label className="font-medium text-gray-900">
          {employeeData.department}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">Position</label>
        <label className="font-medium text-gray-900">
          {employeeData.job_position}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">Job Level</label>
        <label className="font-medium text-gray-900">
          {employeeData.job_level}
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">Primary Direct Report</label>
        <div className="font-medium text-gray-900">
          {employeeData.primary_direct_report.length > 0
            ? <React.Fragment key={employeeData.primary_direct_report[0]?.id}>
            <span className="font-semibold">{employeeData.primary_direct_report[0]?.name}</span>
            {/* IF NEEDED & BE READY */}
            {/* <span className="text-text-disabled">
              {" "}
              ({employeeData.primary_direct_report[0]?.job_position})
            </span> */}
          </React.Fragment>
            : "None"}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">
          Additional Direct Report
        </label>
        <div className="font-medium text-gray-900">
          {employeeData.secondary_direct_report.length > 0
            ? <React.Fragment key={employeeData.secondary_direct_report[0]?.id}>
                <span className="font-semibold">{employeeData.secondary_direct_report[0]?.name}</span>
                {/* IF NEEDED & BE READY */}
                {/* <span className="text-text-disabled">
                  {" "}
                  ({employeeData.secondary_direct_report[0]?.job_position})
                </span> */}
              </React.Fragment>
            : "None"}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-500">Teams</label>
        <div className="flex flex-wrap gap-2">
          {employeeData?.team_members.map((team) => (
            <div
              key={team.id}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
            >
              {team.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EditView = ({
  form,
  employeeData,
  departmentOptions,
  positionOptions,
  jobLevelOptions,
  teamOptions,
  // employeesOptions,
  primaryOptions,
  secondaryOptions,
  isLoadingPrimary,
  isLoadingSecondary,
  isDepartmentsLoading,
  isJobLevelsLoading,
  isPositionsLoading,
  isTeamsLoading,
  departmentsError,
  jobLevelsError,
  positionsError,
  teamsError,
  primarySearch,
  secondarySearch,
  setPrimarySearch,
  setSecondarySearch,
}: {
  form: UseFormReturn<EditEmployeeFormValues>;
  employeeData: EmployeeNode;
  departmentOptions: { label: string; value: string }[];
  positionOptions: { label: string; value: string }[];
  jobLevelOptions: { label: string; value: string }[];
  teamOptions: { label: string; value: string }[];
  // employeesOptions: { label: string; value: string }[];
  primaryOptions: { label: string; value: string }[];
  secondaryOptions: { label: string; value: string }[];
  isLoadingPrimary?: boolean;
  isLoadingSecondary?: boolean;
  isDepartmentsLoading?: boolean;
  isJobLevelsLoading?: boolean;
  isPositionsLoading?: boolean;
  isTeamsLoading?: boolean;
  departmentsError?: any;
  jobLevelsError?: any;
  positionsError?: any;
  teamsError?: any;
  primarySearch?: string;
  secondarySearch?: string;
  setPrimarySearch?: Dispatch<SetStateAction<string>>;
  setSecondarySearch?: Dispatch<SetStateAction<string>>;
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={employeeData.photo_profile} />
          <AvatarFallback>{employeeData.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{employeeData.name}</p>
          <p className="text-xs text-gray-500">{employeeData.job_position}</p>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-secondary">Email</label>
          <label className="text-sm text-text-secondary">
            {employeeData.email}
          </label>
        </div>
        <div className="flex flex-col gap-2 pr-30">
          <label className="text-sm text-text-secondary">Phone Number</label>
          <label className="text-sm text-text-secondary">
            {employeeData.phone_number}
          </label>
        </div>
      </div>
      <SelectForm
        name="department_id"
        label="Department"
        options={departmentOptions}
        disabled={isDepartmentsLoading || !!departmentsError}
        required
      />
      <SelectForm
        name="job_position_id"
        label="Position"
        options={positionOptions}
        disabled={isPositionsLoading || !!positionsError}
        required
      />
      <SelectForm
        name="job_level_id"
        label="Job Level"
        options={jobLevelOptions}
        disabled={isJobLevelsLoading || !!jobLevelsError}
        required
      />

      <ComboboxForm
        name="primary_direct_report"
        label="Primary Direct Report"
        options={primaryOptions}
        searchValue={primarySearch}
        onSearchChange={setPrimarySearch}
        isLoading={isLoadingPrimary}
        valueType="string"
      />

      <ComboboxForm
        name="additional_direct_report"
        label="Additional Direct Report"
        options={secondaryOptions}
        searchValue={secondarySearch}
        onSearchChange={setSecondarySearch}
        isLoading={isLoadingSecondary}
        valueType="string"
        isOptional
      />

      <FormField
        control={form.control}
        name="team_id"
        render={({ field }) => (
          <FormItem>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Team</label>
              <MultiSelect
                placeholder="All Teams"
                options={teamOptions}
                defaultValue={field.value}
                onValueChange={field.onChange}
                maxCount={3}
                variant="inverted"
                disabled={isTeamsLoading || !!teamsError}
                {...field}
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

  const form = useForm<EditEmployeeFormValues>({
    resolver: zodResolver(editEmployeeFormScheme),
    mode: "onChange",
  });
  const onSubmit = (data: EditEmployeeFormValues) => {
    handleSave(data);
    onOpenChange(false);
    setIsEditMode(false);
  };

  const [primarySearch, setPrimarySearch] = React.useState("");
  const [secondarySearch, setSecondarySearch] = React.useState("");
  const debouncedPrimarySearch = useDebounce(primarySearch, 300);
  const debouncedSecondarySearch = useDebounce(secondarySearch, 300);

  const { data: primaryEmployees, isFetching: isLoadingPrimary } = useQuery({
    queryKey: ["employees", "primary", debouncedPrimarySearch],
    queryFn: () =>
      getEmployees(
        debouncedPrimarySearch
          ? { search: debouncedPrimarySearch, per_page: 100 }
          : { per_page: 100 },
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  const { data: secondaryEmployees, isFetching: isLoadingSecondary } = useQuery({
    queryKey: ["employees", "secondary", debouncedSecondarySearch],
    queryFn: () =>
      getEmployees(
        debouncedSecondarySearch
          ? { search: debouncedSecondarySearch, per_page: 100 }
          : { per_page: 100 },
      ),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
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

  const primaryOptions = React.useMemo(() => {
    const options =
      primaryEmployees?.data?.data?.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      })) ?? [];

    // Keep the current primary report selectable even if outside the fetched page.
    const current = employeeData?.primary_direct_report?.[0];
    if (current?.id != null && current.name) {
      const currentId = String(current.id);
      if (!options.some((option) => option.value === currentId)) {
        options.unshift({
          label: current.name,
          value: currentId,
        });
      }
    }

    return options;
  }, [primaryEmployees?.data, employeeData?.primary_direct_report]);

  const secondaryOptions = React.useMemo(() => {
    const options =
      secondaryEmployees?.data?.data?.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      })) ?? [];

    // Keep the current additional report selectable even if outside the fetched page.
    const current = employeeData?.secondary_direct_report?.[0];
    if (current?.id != null && current.name) {
      const currentId = String(current.id);
      if (!options.some((option) => option.value === currentId)) {
        options.unshift({
          label: current.name,
          value: currentId,
        });
      }
    }

    return options;
  }, [secondaryEmployees?.data, employeeData?.secondary_direct_report]);

  const departmentOptions = React.useMemo(() => {
    const options =
      departments?.data?.data?.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      })) ?? [];

    // Keep the employee's current department selectable even if it is missing
    // from the fetched list (e.g. soft-deleted or outside the page window).
    if (employeeData?.department_id != null && employeeData.department) {
      const currentId = String(employeeData.department_id);
      if (!options.some((option) => option.value === currentId)) {
        options.unshift({
          label: employeeData.department,
          value: currentId,
        });
      }
    }

    return options;
  }, [
    departments?.data,
    employeeData?.department,
    employeeData?.department_id,
  ]);

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
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className={cn("overflow-y-auto pr-2 mt-4", "max-h-[500px]")}>
              {isEditMode ? (
                <EditView
                  employeeData={employeeData}
                  form={form}
                  departmentOptions={departmentOptions}
                  primaryOptions={primaryOptions}
                  secondaryOptions={secondaryOptions}
                  jobLevelOptions={jobLevelOptions}
                  positionOptions={positionOptions}
                  teamOptions={teamOptions}
                  isLoadingPrimary={isLoadingPrimary}
                  isLoadingSecondary={isLoadingSecondary}
                  isDepartmentsLoading={isDepartmentsLoading}
                  isJobLevelsLoading={isJobLevelsLoading}
                  isPositionsLoading={isPositionsLoading}
                  departmentsError={departmentsError}
                  jobLevelsError={jobLevelsError}
                  isTeamsLoading={isTeamsLoading}
                  positionsError={positionsError}
                  teamsError={teamsError}
                  primarySearch={primarySearch}
                  secondarySearch={secondarySearch}
                  setPrimarySearch={setPrimarySearch}
                  setSecondarySearch={setSecondarySearch}
                />
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
                    onClick={() => {
                      setIsEditMode(false);
                    }}
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={form.handleSubmit(onSubmit)}
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
                      form.reset({
                        employee_id: employeeData.employeeId,
                        department_id: String(employeeData.department_id),
                        job_position_id: String(employeeData.job_position_id),
                        job_level_id: String(employeeData.job_level_id),
                        primary_direct_report:
                          employeeData.primary_direct_report.map((r) =>
                            String(r.id)
                          )[0],
                        additional_direct_report:
                          employeeData.secondary_direct_report.map((r) =>
                            String(r.id)
                          )[0],
                        team_id: employeeData.team_members.map((t) =>
                          String(t.id)
                        ),
                      });
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
