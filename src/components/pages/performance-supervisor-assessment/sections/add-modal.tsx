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
import { useForm, SubmitHandler } from "react-hook-form";
import { useSupervisorAssessment } from "../hook";
import { MultiSelectForm } from "@/components/ui/multi-select";

interface AssessmentFormData {
  employeeName: string;
  assignedAssessor: string;
  targetPosition: string;
  targetJobLevel: string;
  assessmentForm: string;
}

interface SupervisorAssessmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AssessmentFormData) => void;
}

const SupervisorAssessmentFormModal: React.FC<
  SupervisorAssessmentFormModalProps
> = ({ open, onOpenChange, onSubmit }) => {
  const {
    employeesOptions,
    positionOptions,
    isPositionsLoading,
    positionsError,
    jobLevelOptions,
    jobLevelsError,
    isJobLevelsLoading,
    isLoadingEmployees,
    searchAssesssor,
    setSearchAssesssor,
    formOptions,
    isLoadingForms,
    formsError,
  } = useSupervisorAssessment();
  const form = useForm<AssessmentFormData>();

  const handleFormSubmit: SubmitHandler<AssessmentFormData> = (data) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  const handleCancel = (): void => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>New Supervisor Assessment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4">
            <SelectEmployeeForm
              name="name"
              label="Employee Name"
              required
              options={employeesOptions}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">
                Assigned Assessor
                <span className="text-red-500 ml-1">*</span>
              </label>
              <MultiSelectForm
                options={employeesOptions}
                name="assessors"
                maxCount={3}
                searchPlaceholder="Search Employee"
                hideSelectAll
                disabled={isLoadingEmployees}
                valueTransformer={(value: string) => Number(value)}
                searchValue={searchAssesssor}
                onSearchChange={setSearchAssesssor}
              />
            </div>
            <SelectForm
              name="target_position_id"
              label="Target Position"
              options={positionOptions}
              required
              className="w-full"
              disabled={isPositionsLoading || !!positionsError}
            />
            <SelectForm
              name="target_job_level"
              label="Target Job Level"
              options={jobLevelOptions}
              required
              className="w-full"
              disabled={isJobLevelsLoading || !!jobLevelsError}
            />
            <SelectForm
              name="form_id"
              label="Assessment Form"
              options={formOptions}
              required
              className="w-full"
              disabled={isLoadingForms || !!formsError}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={form.handleSubmit(handleFormSubmit)}
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SupervisorAssessmentFormModal;
