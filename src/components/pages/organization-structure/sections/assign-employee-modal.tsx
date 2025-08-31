/* eslint-disable @typescript-eslint/no-explicit-any */
// assign-employee-modal.tsx
"use client";

import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Command as CommandPrimitive } from "cmdk";
import {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  assignEmployeeFormScheme,
  AssignEmployeeFormValues,
  EmployeeNode,
} from "../types";
import { Loader2, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SelectForm } from "@/components/ui/select-form";
import { MultiSelect } from "@/components/ui/multi-select";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/components/pages/organization-structure/hooks";
import { getEmployees } from "@/services/employees/index";
import { IEmployeeResponse } from "@/services/employees/types";
import { getDepartment } from "@/services/department";
import { getJobLevels } from "@/services/job-levels";
import { getJobPosition } from "@/services/job-position";
import { getTeam } from "@/services/team";

interface AssignEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  handleSave: (values: AssignEmployeeFormValues) => void;
  chartEmployees: EmployeeNode[];
  parentId?: string;
}

export default function AssignEmployeeModal({
  open,
  onOpenChange,
  handleSave,
  chartEmployees,
  parentId,
}: AssignEmployeeModalProps) {
  const [selectedEmployee, setSelectedEmployee] =
    useState<IEmployeeResponse | null>(null);
  const [search, setSearch] = useState("");
  const form = useForm<AssignEmployeeFormValues>({
    resolver: zodResolver(assignEmployeeFormScheme),
    mode: "onChange",
  });

  // const watchedDepartmentId = form.watch("department");
  // const watchedJobPositionId = form.watch("position");
  // const watchedJobLevelId = form.watch("jobLevel");
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

  const debouncedSearch = useDebounce(search, 500);
  const { data: employeeResponse, isLoading } = useQuery({
    queryKey: ["unassignedEmployees", debouncedSearch],
    queryFn: () => getEmployees({ search: debouncedSearch }),
    enabled: debouncedSearch.length > 0,
  });

  const employees = employeeResponse?.data?.data || [];

  const onSubmit = (data: AssignEmployeeFormValues) => {
    if (selectedEmployee) {
      handleSave(data);
      setSelectedEmployee(null);
      setSearch("");
      form.reset();
    }
  };

  const handleClose = () => {
    setSelectedEmployee(null);
    setSearch("");
    form.reset();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-xl bg-white flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle>Assign Employee</AlertDialogTitle>
        </AlertDialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div
              className={cn(
                "overflow-y-auto pr-2 mt-4",
                selectedEmployee ? "max-h-[500px]" : "max-h-[300px]"
              )}
            >
              {!selectedEmployee ? (
                <FormField
                  control={form.control}
                  name="employee_id"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Employee Name{" "}
                        {!selectedEmployee && (
                          <span className="text-red-500">*</span>
                        )}
                      </FormLabel>
                      <Command className="rounded border-t-0">
                        <div className="flex h-9 items-center gap-2 border rounded px-3">
                          <CommandPrimitive.Input
                            value={search}
                            onValueChange={setSearch}
                            data-slot="command-input"
                            className={cn(
                              "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
                            )}
                            placeholder="Enter Employee"
                          />
                          <SearchIcon className="size-4 opacity-50" />
                        </div>
                        <CommandList>
                          {isLoading && (
                            <div className="p-4 flex justify-center items-center">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {!isLoading && (
                            <CommandEmpty className="py-4 text-center text-sm text-gray-400" />
                          )}
                          <CommandGroup className="max-h-20 overflow-y-auto">
                            {employees.map((employee) => (
                              <CommandItem
                                key={employee.id}
                                value={employee.name}
                                onSelect={() => {
                                  setSelectedEmployee(employee);
                                  form.setValue(
                                    "employee_id",
                                    String(employee.id)
                                  );
                                  form.setValue(
                                    "department_id",
                                    String(employee.department_id)
                                  );
                                  form.setValue(
                                    "job_position_id",
                                    String(employee.job_position_id)
                                  );
                                  form.setValue(
                                    "job_level_id",
                                    String(employee.job_level_id)
                                  );

                                  const employeeOnChart = chartEmployees.find(
                                    (chartEmp) =>
                                      chartEmp.employeeId ===
                                      String(employee.id)
                                  );

                                  const primaryReports = employeeOnChart
                                    ? employeeOnChart.primary_direct_report.map(
                                        (report) => String(report.id)
                                      )
                                    : [];

                                  if (parentId) {
                                    primaryReports.push(parentId);
                                  }

                                  const uniquePrimaryReports = [
                                    ...new Set(primaryReports),
                                  ];

                                  form.setValue(
                                    "primary_direct_report",
                                    uniquePrimaryReports
                                  );

                                  if (employeeOnChart) {
                                    form.setValue(
                                      "additional_direct_report",
                                      employeeOnChart.secondary_direct_report.map(
                                        (report) => String(report.id)
                                      )
                                    );
                                    form.setValue(
                                      "team_id",
                                      employeeOnChart.team_members.map((team) =>
                                        String(team.id)
                                      )
                                    );
                                  }
                                }}
                              >
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage
                                    src={employee.photo_profile_url ?? ""}
                                  />
                                  <AvatarFallback>
                                    {employee.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{employee.name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedEmployee.photo_profile_url ?? ""}
                      />
                      <AvatarFallback>
                        {selectedEmployee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedEmployee.name}</p>
                      <p className="text-xs text-gray-500">
                        {selectedEmployee.job_position}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-text-secondary">
                        Email
                      </label>
                      <label className="text-sm text-text-secondary">
                        {selectedEmployee.email}
                      </label>
                    </div>
                    <div className="flex flex-col gap-2 pr-30">
                      <label className="text-sm text-text-secondary">
                        Phone Number
                      </label>
                      <label className="text-sm text-text-secondary">
                        {selectedEmployee.phone_number}
                      </label>
                    </div>
                  </div>
                  <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-sm text-text-secondary">
                          Department<span className="text-red-500">*</span>
                        </label>
                        <SelectForm
                          options={departmentOptions}
                          {...field}
                          required
                          disabled={isDepartmentsLoading || !!departmentsError}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="job_position_id"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-sm text-text-secondary">
                          Position<span className="text-red-500">*</span>
                        </label>
                        <SelectForm
                          options={positionOptions}
                          required
                          disabled={isPositionsLoading || !!positionsError}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="job_level_id"
                    render={({ field }) => (
                      <FormItem>
                        <label className="text-sm text-text-secondary">
                          Job Level<span className="text-red-500">*</span>
                        </label>
                        <SelectForm
                          options={jobLevelOptions}
                          required
                          disabled={isJobLevelsLoading || !!jobLevelsError}
                          {...field}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="primary_direct_report"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Primary Direct Report{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <MultiSelect
                            options={employeesOptions}
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            maxCount={3}
                            variant="inverted"
                            disabled={isLoadingEmployees}
                            {...field}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additional_direct_report"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Additional Direct Report
                          </label>
                          <MultiSelect
                            options={employeesOptions}
                            defaultValue={field.value}
                            onValueChange={field.onChange}
                            maxCount={3}
                            variant="inverted"
                            disabled={isLoadingEmployees}
                            {...field}
                          />
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="team_id"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-text-secondary">
                            Team
                          </label>
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
              )}
            </div>

            <AlertDialogFooter className="flex justify-center gap-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="min-w-[100px] text-primary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!form.formState.isValid || !selectedEmployee}
                className="min-w-[100px] bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
