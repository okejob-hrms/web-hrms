/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SelectForm } from "@/components/ui/select-form";
import { DatePicker } from "@/components/ui/date-picker";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/input";
import { TextAreaForm } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { getDepartment, postDepartment } from "@/services/department";
import {
  departmentFormScheme,
  IDepartmentForm,
} from "@/services/department/types";
import {
  IPositionForm,
  positionFormScheme,
} from "@/services/job-position/types";
import { getJobPosition, postJobPosition } from "@/services/job-position";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobLevels, postJobLevel } from "@/services/job-levels";
import { toast } from "sonner";
import { getTeam, postTeam } from "@/services/team";
import { ITeamForm, teamFormScheme } from "@/services/team/types";

export const AddNewJobLevelModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<IPositionForm>({
    resolver: zodResolver(positionFormScheme),
    defaultValues: {
      name: "",
    },
  });

  const addJobLevel = useMutation({
    mutationFn: (values: IPositionForm) => postJobLevel(values),
    onSuccess: () => {
      toast.success("Job level added successfully!");
      queryClient.invalidateQueries({ queryKey: ["job-levels"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add job level: ${error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = (values: IPositionForm) => {
    addJobLevel.mutate(values);
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addJobLevel.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Job Level
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Job Level</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputForm
              name="name"
              label="Job Level"
              required
              disabled={addJobLevel.isPending}
            />

            {/* Show error message if mutation fails */}
            {addJobLevel.isError && (
              <div className="text-error text-sm mt-2">
                Error:{" "}
                {addJobLevel.error?.message || "Failed to save job level"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={addJobLevel.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addJobLevel.isPending}>
                {addJobLevel.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewPositionModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<IPositionForm>({
    resolver: zodResolver(positionFormScheme),
    defaultValues: {
      name: "",
    },
  });

  const addPosition = useMutation({
    mutationFn: (values: IPositionForm) => postJobPosition(values),
    onSuccess: () => {
      toast.success("Position added successfully!");
      queryClient.invalidateQueries({ queryKey: ["job-position"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add position: ${error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = (values: IPositionForm) => {
    addPosition.mutate(values);
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addPosition.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Position
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Position</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputForm
              name="name"
              label="Position Name"
              required
              disabled={addPosition.isPending}
            />

            {/* Show error message if mutation fails */}
            {addPosition.isError && (
              <div className="text-error text-sm mt-2">
                Error: {addPosition.error?.message || "Failed to save position"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={addPosition.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addPosition.isPending}>
                {addPosition.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewDepartmentModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<IDepartmentForm>({
    resolver: zodResolver(departmentFormScheme),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const addDepartment = useMutation({
    mutationFn: (values: IDepartmentForm) => postDepartment(values),
    onSuccess: () => {
      toast.success("Department added successfully!");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add department: ${error.message || "Unknown error"}`,
      );
    },
  });

  const onSubmit = (values: IDepartmentForm) => {
    addDepartment.mutate(values);
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addDepartment.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Department
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Department</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputForm
              name="name"
              label="Department Name"
              required
              disabled={addDepartment.isPending}
            />
            <TextAreaForm
              name="description"
              label="Description"
              isOptional
              disabled={addDepartment.isPending}
            />

            {/* Show error message if mutation fails */}
            {addDepartment.isError && (
              <div className="text-error text-sm mt-2">
                Error:{" "}
                {addDepartment.error?.message || "Failed to save department"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={addDepartment.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addDepartment.isPending}>
                {addDepartment.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewTeamModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ITeamForm>({
    resolver: zodResolver(teamFormScheme),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const addTeam = useMutation({
    mutationFn: (values: ITeamForm) => postTeam(values),
    onSuccess: () => {
      toast.success("Team added successfully!");

      queryClient.invalidateQueries({ queryKey: ["teams"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast.error(`Failed to add team: ${error.message || "Unknown error"}`);
    },
  });

  const onSubmit = (values: ITeamForm) => {
    addTeam.mutate(values);
  };

  const handleCancel = () => {
    setOpen(false);
    form.reset();
    addTeam.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          + Add New Team
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <InputForm
              name="name"
              label="Team Name"
              required
              disabled={addTeam.isPending}
            />
            <TextAreaForm
              name="description"
              label="Description"
              isOptional
              disabled={addTeam.isPending}
            />

            {/* Show error message if mutation fails */}
            {addTeam.isError && (
              <div className="text-error text-sm mt-2">
                Error: {addTeam.error?.message || "Failed to save team"}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={addTeam.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addTeam.isPending}>
                {addTeam.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const EmployeeinformationSection = React.memo(
  function EmployeeinformationSection() {
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
      queryKey: ["job-levels"],
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
      queryKey: ["job-position"],
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

    const departmentOptions = React.useMemo(() => {
      if (departments?.data?.data) {
        return departments.data.data.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [departments?.data]);

    const positionOptions = React.useMemo(() => {
      if (positions?.data) {
        return positions.data.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [positions?.data]);

    const jobLevelOptions = React.useMemo(() => {
      if (jobLevels?.data) {
        return jobLevels.data.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [jobLevels?.data]);

    const teamOptions = React.useMemo(() => {
      if (teams?.data?.data) {
        return teams.data.data.map((item) => ({
          label: item.name,
          value: item.name,
        }));
      }
      return [];
    }, [teams?.data]);

    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Employment Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end w-full">
          <SelectForm
            name="position"
            label="Position"
            options={positionOptions}
            required
            className="w-full"
            modalChildren={<AddNewPositionModal />}
            disabled={isPositionsLoading || !!positionsError}
          />
          <SelectForm
            name="department"
            label="Department"
            options={departmentOptions}
            required
            modalChildren={<AddNewDepartmentModal />}
            disabled={isDepartmentsLoading || !!departmentsError}
          />
          <SelectForm
            name="jobLevel"
            label="Job Level"
            options={jobLevelOptions}
            required
            modalChildren={<AddNewJobLevelModal />}
            disabled={isJobLevelsLoading || !!jobLevelsError}
          />
          <SelectForm
            name="primaryDirectReport"
            label="Primary Direct Report"
            options={[
              { label: "Junior", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <SelectForm
            name="additionalDirectReport"
            label="Additional Direct Report"
            options={[
              { label: "Junior", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
          />
          <SelectForm
            name="team"
            label="Team"
            options={teamOptions}
            required
            modalChildren={<AddNewTeamModal />}
            disabled={isTeamsLoading || !!teamsError}
          />
          <DatePicker name="startDate" label="Employment Start Date" />
          <DatePicker name="endDate" label="Employment End Date" />
          <SelectForm
            name="status"
            label="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Terminated", value: "terminated" },
              { label: "On Leave", value: "on-leave" },
            ]}
            required
          />
          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
