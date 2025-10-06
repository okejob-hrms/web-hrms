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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { getDepartment, postDepartment } from "@/services/department";
import { IDepartmentForm } from "@/services/department/types";
import { IPositionForm } from "@/services/job-position/types";
import { getJobPosition, postJobPosition } from "@/services/job-position";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobLevels, postJobLevel } from "@/services/job-levels";
import { toast } from "sonner";
import { getTeam, postTeam } from "@/services/team";
import { ITeamForm } from "@/services/team/types";
import { getEmployees } from "@/services/employees";
import { useDebounce } from "@/hooks/use-debounce";
import { ComboboxForm } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { ApiErrorResponse } from "@/lib/types";

export const AddNewJobLevelModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();

  const addJobLevel = useMutation({
    mutationFn: (values: IPositionForm) => postJobLevel(values),
    onSuccess: () => {
      toast.success("Job level added successfully!");
      queryClient.invalidateQueries({ queryKey: ["job_level_id"] });
      handleClose();
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || "Failed to add new job level");
              setError(errorData.message || "Failed to add new job level");
            })
            .catch(() => {
              toast.error("Failed to add new job level: Server error");
              setError("Failed to add new job level: Server error");
            });
        } catch (parseError) {
          toast.error(
            "Failed to add new job level: Server error : " + parseError,
          );
          setError("Failed to add new job level: Server error : " + parseError);
        }
      } else {
        toast.error(
          `Failed to add new job level: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name) {
      setError("Job level is required");
      return;
    }

    addJobLevel.mutate({ name: name, status: "1" });
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setError("");
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
        <div className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <div className="flex">
              <Label htmlFor="job-level-name" className="text-sm font-normal">
                Job Level
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="job-level-name"
              placeholder="Job Level"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={addJobLevel.isPending}
            />
            {error && <div className="text-error text-sm">{error}</div>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addJobLevel.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={addJobLevel.isPending}
            >
              {addJobLevel.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewPositionModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();

  const addPosition = useMutation({
    mutationFn: (values: IPositionForm) => postJobPosition(values),
    onSuccess: () => {
      toast.success("Position added successfully!");
      queryClient.invalidateQueries({ queryKey: ["job_position_id"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add position: ${error.message || "Unknown error"}`,
      );
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name) {
      setError("Name is required");
      return;
    }

    addPosition.mutate({ name: name, status: "1" });
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setError("");
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
        <div className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <div className="flex">
              <Label htmlFor="position-name" className="text-sm font-normal">
                Position Name
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="position-name"
              placeholder="Position Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={addPosition.isPending}
            />
            {error && <div className="text-error text-sm">{error}</div>}
            {addPosition.isError && (
              <div className="text-error text-sm">
                Error: {addPosition.error?.message || "Failed to save position"}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addPosition.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={addPosition.isPending}
            >
              {addPosition.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewDepartmentModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();

  const addDepartment = useMutation({
    mutationFn: (values: IDepartmentForm) => postDepartment(values),
    onSuccess: () => {
      toast.success("Department added successfully!");
      queryClient.invalidateQueries({ queryKey: ["department_id"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        `Failed to add department: ${error.message || "Unknown error"}`,
      );
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("Department name is required");
      return;
    }

    addDepartment.mutate({
      name: name.trim(),
      description: description.trim(),
    });
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setError("");
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
        <div className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <div className="flex">
              <Label htmlFor="department-name" className="text-sm font-normal">
                Department Name
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="department-name"
              placeholder="Department Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={addDepartment.isPending}
            />
            {error && <div className="text-error text-sm">{error}</div>}
          </div>

          <div className="grid w-full items-center gap-3">
            <Label
              htmlFor="department-description"
              className="text-sm font-normal"
            >
              Description{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="department-description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={addDepartment.isPending}
              rows={4}
            />
          </div>

          {addDepartment.isError && (
            <div className="text-error text-sm">
              Error:{" "}
              {addDepartment.error?.message || "Failed to save department"}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addDepartment.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={addDepartment.isPending}
            >
              {addDepartment.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewTeamModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();

  const addTeam = useMutation({
    mutationFn: (values: ITeamForm) => postTeam(values),
    onSuccess: () => {
      toast.success("Team added successfully!");
      queryClient.invalidateQueries({ queryKey: ["team_id"] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(`Failed to add team: ${error.message || "Unknown error"}`);
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError("Team name is required");
      return;
    }

    addTeam.mutate({
      name: name.trim(),
      description: description.trim(),
    });
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setDescription("");
    setError("");
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
        <div className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <div className="flex">
              <Label htmlFor="team-name" className="text-sm font-normal">
                Team Name
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="team-name"
              placeholder="Team Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={addTeam.isPending}
            />
            {error && <div className="text-error text-sm">{error}</div>}
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="team-description" className="text-sm font-normal">
              Description{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="team-description"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={addTeam.isPending}
              rows={4}
            />
          </div>

          {addTeam.isError && (
            <div className="text-error text-sm">
              Error: {addTeam.error?.message || "Failed to save team"}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addTeam.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={addTeam.isPending}
            >
              {addTeam.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const EmployeeinformationSection = React.memo(
  function EmployeeinformationSection() {
    const { watch, setValue } = useFormContext();
    const watchedDepartmentId = watch("department_id");
    const watchedJobPositionId = watch("job_position_id");
    const watchedJobLevelId = watch("job_level_id");
    const watchedDirectReports = watch("direct_reports") || [
      { relationship_type: "primary", direct_report_id: [] },
      { relationship_type: "secondary", direct_report_id: [] },
    ];
    const [primarySearch, setPrimarySearch] = React.useState("");
    const [secondarySearch, setSecondarySearch] = React.useState("");
    const debouncedPrimarySearch = useDebounce(primarySearch, 300);
    const debouncedSecondarySearch = useDebounce(secondarySearch, 300);
    const {
      data: departments,
      isLoading: isDepartmentsLoading,
      error: departmentsError,
    } = useQuery({
      queryKey: ["department_id"],
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
      queryKey: ["job_level_id"],
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
      queryKey: ["job_position_id"],
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
      queryKey: ["team_id"],
      queryFn: () => getTeam(),
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const { data: allEmployees, isLoading: isLoadingAllEmployees } = useQuery({
      queryKey: [
        "all-employees",
        debouncedPrimarySearch || debouncedSecondarySearch,
      ],
      queryFn: () =>
        getEmployees(
          debouncedPrimarySearch || debouncedSecondarySearch
            ? { search: debouncedPrimarySearch || debouncedSecondarySearch }
            : {},
        ),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const { data: filteredEmployees, isLoading: isLoadingFilteredEmployees } =
      useQuery({
        queryKey: [
          "filtered-employees",
          watchedDepartmentId,
          watchedJobPositionId,
          watchedJobLevelId,
        ],
        queryFn: () =>
          getEmployees({
            per_page: 100,
            department_ids: watchedDepartmentId
              ? [watchedDepartmentId]
              : undefined,
            job_position_ids: watchedJobPositionId
              ? [watchedJobPositionId]
              : undefined,
            job_level_ids: watchedJobLevelId ? [watchedJobLevelId] : undefined,
          }),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!(
          watchedDepartmentId ||
          watchedJobPositionId ||
          watchedJobLevelId
        ),
      });

    const employees =
      watchedDepartmentId || watchedJobPositionId || watchedJobLevelId
        ? filteredEmployees
        : allEmployees;

    const isLoadingEmployees =
      watchedDepartmentId || watchedJobPositionId || watchedJobLevelId
        ? isLoadingFilteredEmployees
        : isLoadingAllEmployees;

    const employeesOptions = React.useMemo(() => {
      if (employees?.data?.data) {
        return employees.data.data.map((item) => ({
          label: item.name,
          value: item.id.toString(),
        }));
      }
      return [];
    }, [employees?.data]);

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
    React.useEffect(() => {
      if (!watchedDirectReports || watchedDirectReports.length === 0) {
        setValue("direct_reports", [
          { relationship_type: "primary", direct_report_id: [] },
          { relationship_type: "secondary", direct_report_id: [] },
        ]);
      }
    }, [watch, setValue]);

    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Employment Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start w-full">
          <SelectForm
            name="job_position_id"
            label="Position"
            options={positionOptions}
            required
            className="w-full"
            modalChildren={<AddNewPositionModal />}
            disabled={isPositionsLoading || !!positionsError}
          />
          <SelectForm
            name="department_id"
            label="Department"
            options={departmentOptions}
            required
            modalChildren={<AddNewDepartmentModal />}
            disabled={isDepartmentsLoading || !!departmentsError}
          />
          <SelectForm
            name="job_level_id"
            label="Job Level"
            options={jobLevelOptions}
            required
            modalChildren={<AddNewJobLevelModal />}
            disabled={isJobLevelsLoading || !!jobLevelsError}
          />
          {/* <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">
              Primary Direct Report
            </label>
            <MultiSelectForm
              options={employeesOptions}
              name="direct_reports.0.direct_report_id"
              maxCount={2}
              searchPlaceholder="Search Employee"
              hideSelectAll
              disabled={isLoadingEmployees}
              valueTransformer={(value) => Number(value)}
              searchValue={primarySearch}
              onSearchChange={setPrimarySearch}
              defaultValue={
                watchedDirectReports[0]?.direct_report_id?.map((id: any) =>
                  id.toString(),
                ) || []
              }
            />
            <input
              type="hidden"
              value="primary"
              {...register("direct_reports.0.relationship_type")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">
              Additional Direct Report
            </label>
            <MultiSelectForm
              options={employeesOptions}
              name="direct_reports.1.direct_report_id"
              maxCount={2}
              searchPlaceholder="Search Employee"
              hideSelectAll
              disabled={isLoadingEmployees}
              valueTransformer={(value) => Number(value)}
              searchValue={secondarySearch}
              onSearchChange={setSecondarySearch}
              defaultValue={
                watchedDirectReports[1]?.direct_report_id?.map((id: any) =>
                  id.toString(),
                ) || []
              }
            />
            <input
              type="hidden"
              value="secondary"
              {...register("direct_reports.1.relationship_type")}
            />
          </div> */}
          <ComboboxForm
            name="primary_direct_report_id"
            label="Primary Direct Report"
            options={employeesOptions}
            disabled={isLoadingEmployees}
            valueType="number"
          />
          <ComboboxForm
            name="additional_direct_report_id"
            label="Additional Direct Report"
            options={employeesOptions}
            disabled={isLoadingEmployees}
            isOptional
            valueType="number"
          />
          <SelectForm
            name="team_members"
            label="Team"
            options={teamOptions}
            required
            modalChildren={<AddNewTeamModal />}
            disabled={isTeamsLoading || !!teamsError}
          />
          <DatePicker name="start_date" label="Employment Start Date" />
          <DatePicker name="end_date" label="Employment End Date" />
          <SelectForm
            name="status"
            label="Status"
            options={[
              { label: "Active", value: "1" },
              { label: "Inactive", value: "0" },
            ]}
            required
          />
          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
