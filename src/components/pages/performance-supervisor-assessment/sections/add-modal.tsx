import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { SelectEmployeeForm, SelectForm } from "@/components/ui/select-form";
import React from "react";
import { useTranslations } from "next-intl";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { ISupervisorAssessmentMutation } from "@/services/performances/supervisor-assessment/types";
import { getEmployeeDetailByUserId } from "@/services/employees";

interface AssessmentFormData {
  user_id: string;
  assessors: number[];
  target_position_id: string;
  target_level_id: string;
  form_id: string;
}

interface EmployeeOption {
  label: string;
  value: string;
  subtitle?: string;
  image?: string;
  profileId?: number;
  department?: string;
  jobPosition?: string;
  jobLevel?: string;
  jobLevelId?: number;
}

interface SupervisorAssessmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ISupervisorAssessmentMutation) => void;
  employeesOptions: EmployeeOption[];
  assessorsOptions: Array<{
    label: string;
    value: string;
    subtitle?: string;
    image?: string;
    profileId?: number;
  }>;
  employeesByProfileId: Map<number, { userId: number; name: string }>;
  positionOptions: Array<{ label: string; value: string }>;
  isPositionsLoading: boolean;
  positionsError: unknown;
  jobLevelOptions: Array<{ label: string; value: string; level: number }>;
  isJobLevelsLoading: boolean;
  jobLevelsError: unknown;
  isLoadingEmployees: boolean;
  isLoadingAssessors: boolean;
  searchAssesssor: string;
  setSearchAssesssor: (value: string) => void;
  searchEmployee: string;
  setSearchEmployee: (value: string) => void;
  formOptions: Array<{ label: string; value: string }>;
  isLoadingForms: boolean;
  formsError: unknown;
  isSubmitting: boolean;
}

const SupervisorAssessmentFormModal: React.FC<
  SupervisorAssessmentFormModalProps
> = ({
  open,
  onOpenChange,
  onSubmit,
  employeesOptions,
  positionOptions,
  isPositionsLoading,
  positionsError,
  jobLevelOptions,
  jobLevelsError,
  isJobLevelsLoading,
  isLoadingAssessors,
  searchAssesssor,
  setSearchAssesssor,
  searchEmployee,
  setSearchEmployee,
  formOptions,
  isLoadingForms,
  formsError,
  isSubmitting,
  assessorsOptions,
  employeesByProfileId,
}) => {
  const t = useTranslations("performance");
  const form = useForm<AssessmentFormData>({
    defaultValues: {
      user_id: "",
      assessors: [],
      target_position_id: "",
      target_level_id: "",
      form_id: "",
    },
  });

  const selectedUserId = form.watch("user_id");
  const selectedTargetLevelId = form.watch("target_level_id");
  const hasEmployee = Boolean(selectedUserId);

  const selectedEmployee = React.useMemo(
    () =>
      employeesOptions.find(
        (option) => option.value === selectedUserId?.toString(),
      ) ?? null,
    [employeesOptions, selectedUserId],
  );

  const currentLevelRank = React.useMemo(() => {
    if (!selectedEmployee?.jobLevelId) return null;
    const match = jobLevelOptions.find(
      (option) => option.value === String(selectedEmployee.jobLevelId),
    );
    return match?.level ?? null;
  }, [selectedEmployee?.jobLevelId, jobLevelOptions]);

  const filteredJobLevelOptions = React.useMemo(() => {
    if (currentLevelRank == null) return [];
    // Only allow same or higher rank (block demotion / lower level).
    return jobLevelOptions.filter((option) => option.level >= currentLevelRank);
  }, [jobLevelOptions, currentLevelRank]);

  const { data: employeeDetail, isFetching: isFetchingEmployeeDetail } =
    useQuery({
      queryKey: ["supervisor-assessment-employee-detail", selectedUserId],
      queryFn: () => getEmployeeDetailByUserId(Number(selectedUserId)),
      enabled: open && Boolean(selectedUserId),
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  React.useEffect(() => {
    if (!open) {
      form.reset();
      setSearchAssesssor("");
      setSearchEmployee("");
    }
  }, [open, form, setSearchAssesssor, setSearchEmployee]);

  // When employee changes: reset dependent fields.
  const previousUserIdRef = React.useRef<string>("");
  const autoAssessorAppliedForRef = React.useRef<string>("");
  React.useEffect(() => {
    if (!open) {
      previousUserIdRef.current = "";
      autoAssessorAppliedForRef.current = "";
      return;
    }

    if (!selectedUserId) {
      previousUserIdRef.current = "";
      autoAssessorAppliedForRef.current = "";
      form.setValue("assessors", []);
      form.setValue("target_position_id", "");
      form.setValue("target_level_id", "");
      form.setValue("form_id", "");
      return;
    }

    if (previousUserIdRef.current === selectedUserId) return;
    previousUserIdRef.current = selectedUserId;
    autoAssessorAppliedForRef.current = "";

    form.setValue("assessors", []);
    form.setValue("target_position_id", "");
    form.setValue("target_level_id", "");
    form.setValue("form_id", "");
  }, [selectedUserId, open, form]);

  React.useEffect(() => {
    if (!selectedUserId || !employeeDetail?.data) return;
    if (previousUserIdRef.current !== selectedUserId) return;
    if (autoAssessorAppliedForRef.current === selectedUserId) return;

    const relationships = employeeDetail.data.reporting_relationships ?? [];
    const primary = relationships.find(
      (item) => item.relationship_type === "primary",
    );

    if (!primary?.direct_report_id) {
      autoAssessorAppliedForRef.current = selectedUserId;
      form.setValue("assessors", []);
      return;
    }

    const manager = employeesByProfileId.get(primary.direct_report_id);
    if (!manager) {
      // Employees list may still be loading; retry when map updates.
      if (employeesByProfileId.size === 0) return;
      autoAssessorAppliedForRef.current = selectedUserId;
      form.setValue("assessors", []);
      toast.info(
        primary.name
          ? `Primary direct report (${primary.name}) could not be resolved as an assessor`
          : "No primary direct report found for this employee",
      );
      return;
    }

    autoAssessorAppliedForRef.current = selectedUserId;

    if (manager.userId === Number(selectedUserId)) {
      form.setValue("assessors", []);
      return;
    }

    form.setValue("assessors", [manager.userId], { shouldDirty: true });
  }, [employeeDetail, selectedUserId, employeesByProfileId, form]);

  // Drop target level if it becomes lower than current after employee change.
  React.useEffect(() => {
    if (!selectedTargetLevelId || currentLevelRank == null) return;
    const selected = jobLevelOptions.find(
      (option) => option.value === selectedTargetLevelId,
    );
    if (selected && selected.level < currentLevelRank) {
      form.setValue("target_level_id", "");
    }
  }, [
    selectedTargetLevelId,
    currentLevelRank,
    jobLevelOptions,
    form,
  ]);

  const handleFormSubmit: SubmitHandler<AssessmentFormData> = (data) => {
    if (!data.user_id) {
      toast.error("Employee Name is required");
      return;
    }
    if (!data.assessors?.length) {
      toast.error("At least one assessor is required");
      return;
    }
    if (!data.target_position_id) {
      toast.error("Target Position is required");
      return;
    }
    if (!data.target_level_id) {
      toast.error("Target Job Level is required");
      return;
    }
    if (!data.form_id) {
      toast.error("Assessment Form is required");
      return;
    }

    const assessorIds = data.assessors.map((id) => Number(id));
    if (assessorIds.includes(Number(data.user_id))) {
      toast.error("Assessor cannot be the same as the employee being assessed");
      return;
    }

    const targetLevel = jobLevelOptions.find(
      (option) => option.value === String(data.target_level_id),
    );
    if (
      currentLevelRank != null &&
      targetLevel &&
      targetLevel.level < currentLevelRank
    ) {
      toast.error("Target job level cannot be lower than current job level");
      return;
    }

    const transformedData: ISupervisorAssessmentMutation = {
      user_id: Number(data.user_id),
      form_id: Number(data.form_id),
      target_position_id: Number(data.target_position_id),
      target_level_id: Number(data.target_level_id),
      assessors: assessorIds,
    };

    onSubmit(transformedData);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    form.reset();
    onOpenChange(false);
  };

  const restDisabled = !hasEmployee || isSubmitting;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>New Supervisor Assessment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            <SelectEmployeeForm
              name="user_id"
              label="Employee Name"
              required
              options={employeesOptions}
              searchValue={searchEmployee}
              onSearchChange={setSearchEmployee}
            />

            {hasEmployee && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-md border border-grayscale-20 bg-grayscale-5/40 p-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-disabled">
                    Current Job Position
                  </span>
                  <span className="text-sm text-foreground">
                    {selectedEmployee?.jobPosition || "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-disabled">
                    Current Job Level
                  </span>
                  <span className="text-sm text-foreground">
                    {selectedEmployee?.jobLevel || "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-text-disabled">Department</span>
                  <span className="text-sm text-foreground">
                    {selectedEmployee?.department || "-"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Assigned Assessor
                <span className="text-red-500 ml-1">*</span>
              </label>
              <MultiSelectForm
                key={`assessors-${selectedUserId}`}
                options={assessorsOptions}
                name="assessors"
                maxCount={3}
                searchPlaceholder={t("searchAssessor")}
                hideSelectAll
                disabled={
                  restDisabled || isLoadingAssessors || isFetchingEmployeeDetail
                }
                valueTransformer={(value: string) => Number(value)}
                searchValue={searchAssesssor}
                onSearchChange={setSearchAssesssor}
              />
              {hasEmployee && isFetchingEmployeeDetail && (
                <p className="text-xs text-text-disabled">
                  Loading primary direct report…
                </p>
              )}
            </div>

            <SelectForm
              name="target_position_id"
              label="Target Position"
              options={positionOptions}
              required
              className="w-full"
              disabled={
                restDisabled || isPositionsLoading || !!positionsError
              }
            />

            <SelectForm
              name="target_level_id"
              label="Target Job Level"
              options={filteredJobLevelOptions}
              required
              className="w-full"
              disabled={
                restDisabled || isJobLevelsLoading || !!jobLevelsError
              }
            />
            {hasEmployee &&
              currentLevelRank != null &&
              filteredJobLevelOptions.length === 0 && (
                <p className="text-xs text-error">
                  No eligible job levels at or above the current level.
                </p>
              )}

            <SelectForm
              name="form_id"
              label="Assessment Form"
              options={formOptions}
              required
              className="w-full"
              disabled={restDisabled || isLoadingForms || !!formsError}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(handleFormSubmit)}
                disabled={isSubmitting || !hasEmployee}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SupervisorAssessmentFormModal;
