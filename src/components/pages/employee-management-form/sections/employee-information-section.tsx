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
import {
  getJobPositionPagination,
  postJobPosition,
} from "@/services/job-position";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJobLevelsPagination, postJobLevel } from "@/services/job-levels";
import { toast } from "sonner";
import { getTeam, postTeam } from "@/services/team";
import { ITeamForm } from "@/services/team/types";
import { getEmployees } from "@/services/employees";
import { useDebounce } from "@/hooks/use-debounce";
import { ComboboxForm } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import { ApiErrorResponse } from "@/lib/types";
import { getBranches } from "@/services/settings";
import { IJobLevelForm } from "@/services/job-levels/types";
import { useTranslations } from "next-intl";

export const AddNewJobLevelModal: React.FC = () => {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [errorName, setErrorName] = React.useState("");
  const [errorLevel, setErrorLevel] = React.useState("");
  const queryClient = useQueryClient();

  const addJobLevel = useMutation({
    mutationFn: (values: IJobLevelForm) => postJobLevel(values),
    onSuccess: () => {
      toast.success(t("jobLevelAddedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["job_level_id"] });
      handleClose();
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || t("jobLevelAddFailed"));
            })
            .catch(() => {
              toast.error(`${t("jobLevelAddFailed")}: ${tCommon("failed")}`);
            });
        } catch (parseError) {
          toast.error(`${t("jobLevelAddFailed")}: ${parseError}`);
        }
      } else {
        toast.error(
          `${t("jobLevelAddFailed")}: ${error.message || tCommon("failed")}`,
        );
      }
    },
  });

  const handleSubmit = () => {
    setErrorName("");
    setErrorLevel("");

    if (!name) {
      setErrorName(t("jobLevelRequired"));
      return;
    }

    if (!level) {
      setErrorLevel(t("levelRequired"));
      return;
    }

    addJobLevel.mutate({ name: name, level: Number(level) });
  };

  const handleClose = () => {
    setOpen(false);
    setName("");
    setLevel("");
    setErrorName("");
    setErrorLevel("");
    addJobLevel.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-primary px-2 justify-start font-semibold text-base bg-primary-focused rounded-none w-full m-0 hover:text-white"
          variant="ghost"
        >
          {t("addNewJobLevel")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{t("createNewJobLevel")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <div className="flex">
              <Label htmlFor="job-level-name" className="text-sm font-normal">
                {t("jobLevel")}
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="job-level-name"
              placeholder={t("jobLevel")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={addJobLevel.isPending}
            />
            {errorName && <div className="text-error text-sm">{errorName}</div>}
            <div className="flex">
              <Label htmlFor="job-level-level" className="text-sm font-normal">
                {t("level")}
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="job-level-level"
              placeholder={t("level")}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              disabled={addJobLevel.isPending}
            />
            {errorLevel && (
              <div className="text-error text-sm">{errorLevel}</div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addJobLevel.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={addJobLevel.isPending}
            >
              {addJobLevel.isPending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewPositionModal: React.FC = () => {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();

  const addPosition = useMutation({
    mutationFn: (values: IPositionForm) => postJobPosition(values),
    onSuccess: () => {
      toast.success(t("positionAddedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["job_position_id"] });
      handleClose();
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || t("positionAddFailed"));
              setError(errorData.message || t("positionAddFailed"));
            })
            .catch(() => {
              toast.error(`${t("positionAddFailed")}: ${tCommon("failed")}`);
              setError(`${t("positionAddFailed")}: ${tCommon("failed")}`);
            });
        } catch (parseError) {
          toast.error(`${t("positionAddFailed")}: ${parseError}`);
          setError(`${t("positionAddFailed")}: ${parseError}`);
        }
      } else {
        toast.error(
          `${t("positionAddFailed")}: ${error.message || tCommon("failed")}`,
        );
      }
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name) {
      setError(t("nameRequired"));
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
          {t("addNewPosition")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{t("createNewPosition")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <div className="flex">
              <Label htmlFor="position-name" className="text-sm font-normal">
                {t("positionName")}
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="position-name"
              placeholder={t("positionName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={addPosition.isPending}
            />
            {error && <div className="text-error text-sm">{error}</div>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addPosition.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={addPosition.isPending}
            >
              {addPosition.isPending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewDepartmentModal: React.FC = () => {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();

  const addDepartment = useMutation({
    mutationFn: (values: IDepartmentForm) => postDepartment(values),
    onSuccess: () => {
      toast.success(t("departmentAddedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["department_id"] });
      handleClose();
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || t("departmentAddFailed"));
              setError(errorData.message || t("departmentAddFailed"));
            })
            .catch(() => {
              toast.error(`${t("departmentAddFailed")}: ${tCommon("failed")}`);
              setError(`${t("departmentAddFailed")}: ${tCommon("failed")}`);
            });
        } catch (parseError) {
          toast.error(`${t("departmentAddFailed")}: ${parseError}`);
          setError(`${t("departmentAddFailed")}: ${parseError}`);
        }
      } else {
        toast.error(
          `${t("departmentAddFailed")}: ${error.message || tCommon("failed")}`,
        );
      }
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError(t("departmentNameRequired"));
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
          {t("addNewDepartment")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{t("createNewDepartment")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <div className="flex">
              <Label htmlFor="department-name" className="text-sm font-normal">
                {t("departmentName")}
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="department-name"
              placeholder={t("departmentName")}
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
              {tCommon("description")}{" "}
              <span className="text-muted-foreground">({t("optionalLabel")})</span>
            </Label>
            <Textarea
              id="department-description"
              placeholder={tCommon("description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={addDepartment.isPending}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addDepartment.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={addDepartment.isPending}
            >
              {addDepartment.isPending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AddNewTeamModal: React.FC = () => {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();

  const addTeam = useMutation({
    mutationFn: (values: ITeamForm) => postTeam(values),
    onSuccess: () => {
      toast.success(t("teamAddedSuccess"));
      queryClient.invalidateQueries({ queryKey: ["team_id"] });
      handleClose();
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(errorData.message || t("teamAddFailed"));
              setError(errorData.message || t("teamAddFailed"));
            })
            .catch(() => {
              toast.error(`${t("teamAddFailed")}: ${tCommon("failed")}`);
              setError(`${t("teamAddFailed")}: ${tCommon("failed")}`);
            });
        } catch (parseError) {
          toast.error(`${t("teamAddFailed")}: ${parseError}`);
          setError(`${t("teamAddFailed")}: ${parseError}`);
        }
      } else {
        toast.error(
          `${t("teamAddFailed")}: ${error.message || tCommon("failed")}`,
        );
      }
    },
  });

  const handleSubmit = () => {
    setError("");

    if (!name.trim()) {
      setError(t("teamNameRequired"));
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
          {t("addNewTeam")}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>{t("createNewTeam")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid w-full items-center gap-3">
            <div className="flex">
              <Label htmlFor="team-name" className="text-sm font-normal">
                {t("teamName")}
              </Label>
              <span className="text-error">*</span>
            </div>
            <Input
              id="team-name"
              placeholder={t("teamName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={addTeam.isPending}
            />
            {error && <div className="text-error text-sm">{error}</div>}
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="team-description" className="text-sm font-normal">
              {tCommon("description")}{" "}
              <span className="text-muted-foreground">({t("optionalLabel")})</span>
            </Label>
            <Textarea
              id="team-description"
              placeholder={tCommon("description")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={addTeam.isPending}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addTeam.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={addTeam.isPending}
            >
              {addTeam.isPending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const EmployeeinformationSection = React.memo(
  function EmployeeinformationSection() {
    const t = useTranslations("employee");
    const tCommon = useTranslations("common");
    const { watch, setValue } = useFormContext();
    const watchedDepartmentId = watch("department_id");
    const watchedJobPositionId = watch("job_position_id");
    const watchedJobLevelId = watch("job_level_id");
    const watchedDirectReports = watch("direct_reports") || [
      { relationship_type: "primary", direct_report_id: [] },
      { relationship_type: "secondary", direct_report_id: [] },
    ];
    const [primarySearch] = React.useState("");
    const [secondarySearch] = React.useState("");
    const debouncedPrimarySearch = useDebounce(primarySearch, 300);
    const debouncedSecondarySearch = useDebounce(secondarySearch, 300);
    const {
      data: departments,
      isLoading: isDepartmentsLoading,
      error: departmentsError,
    } = useQuery({
      queryKey: ["department_id"],
      queryFn: () => getDepartment({ pageSize: 10000, pageIndex: 0 }),
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
      queryFn: () =>
        getJobLevelsPagination({
          pageSize: 10000,
          pageIndex: 0,
        }),
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
      queryFn: () =>
        getJobPositionPagination({
          pageSize: 10000,
          pageIndex: 0,
        }),
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const {
      data: branch,
      isLoading: isBranchLoading,
      error: branchError,
    } = useQuery({
      queryKey: ["branch_id"],
      queryFn: () => getBranches(),
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
      queryFn: () => getTeam({ pageSize: 10000, pageIndex: 0 }),
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
        queryKey: ["filtered-employees", watchedJobLevelId],
        queryFn: () =>
          getEmployees({
            per_page: 10000,
            min_job_level_id: watchedJobLevelId ? watchedJobLevelId : undefined,
          }),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!watchedJobLevelId,
      });

    const employees = watchedJobLevelId ? filteredEmployees : allEmployees;

    const isLoadingEmployees = watchedJobLevelId
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

    const branchOptions = React.useMemo(() => {
      if (branch?.data) {
        return branch.data.map((item) => ({
          label: item.name,
          value: item.id.toString(),
        }));
      }
      return [];
    }, [branch?.data]);

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
          {t("employmentInformation")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start w-full">
          <SelectForm
            name="branch_id"
            label={t("company")}
            options={branchOptions}
            required
            className="w-full"
            modalChildren={<AddNewPositionModal />}
            disabled={isBranchLoading || !!branchError}
          />
          <div></div>
          <SelectForm
            name="job_position_id"
            label={tCommon("position")}
            options={positionOptions}
            required
            className="w-full"
            modalChildren={<AddNewPositionModal />}
            disabled={isPositionsLoading || !!positionsError}
          />
          <SelectForm
            name="department_id"
            label={tCommon("department")}
            options={departmentOptions}
            required
            modalChildren={<AddNewDepartmentModal />}
            disabled={isDepartmentsLoading || !!departmentsError}
          />
          <SelectForm
            name="job_level_id"
            label={t("jobLevel")}
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
              searchPlaceholder={tCommon("searchEmployee")}
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
              searchPlaceholder={tCommon("searchEmployee")}
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
            label={t("primaryDirectReport")}
            options={employeesOptions}
            disabled={isLoadingEmployees}
            valueType="number"
          />
          <ComboboxForm
            name="additional_direct_report_id"
            label={t("additionalDirectReport")}
            options={employeesOptions}
            disabled={isLoadingEmployees}
            isOptional
            valueType="number"
          />
          <SelectForm
            name="team_member"
            label={t("team")}
            options={teamOptions}
            required
            modalChildren={<AddNewTeamModal />}
            disabled={isTeamsLoading || !!teamsError}
          />
          <DatePicker name="start_date" label={t("employmentStartDate")} />
          <DatePicker name="end_date" label={t("employmentEndDate")} />
          <SelectForm
            name="status"
            label={tCommon("status")}
            options={[
              // Employment::STATUS_ACTIVE=1, STATUS_INACTIVE=2
              { label: tCommon("active"), value: "1" },
              { label: tCommon("inactive"), value: "2" },
            ]}
            required
          />
          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
