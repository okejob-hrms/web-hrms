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
import { MultiSelectForm } from "@/components/ui/multi-select";
import { ISupervisorAssessmentMutation } from "@/services/performances/supervisor-assessment/types";

interface AssessmentFormData {
  user_id: string;
  assessors: string[];
  target_position_id: string;
  target_level_id: string;
  form_id: string;
}

interface SupervisorAssessmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ISupervisorAssessmentMutation) => void;
  employeesOptions: Array<{
    label: string;
    value: string;
    subtitle?: string;
    image?: string;
  }>;
  positionOptions: Array<{ label: string; value: string }>;
  isPositionsLoading: boolean;
  positionsError: unknown;
  jobLevelOptions: Array<{ label: string; value: string }>;
  isJobLevelsLoading: boolean;
  jobLevelsError: unknown;
  isLoadingEmployees: boolean;
  searchAssesssor: string;
  setSearchAssesssor: (value: string) => void;
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
  isLoadingEmployees,
  searchAssesssor,
  setSearchAssesssor,
  formOptions,
  isLoadingForms,
  formsError,
  isSubmitting,
}) => {
  const form = useForm<AssessmentFormData>();

  const handleFormSubmit: SubmitHandler<AssessmentFormData> = (data) => {
    const transformedData: ISupervisorAssessmentMutation = {
      user_id: Number(data.user_id),
      form_id: Number(data.form_id),
      target_position_id: Number(data.target_position_id),
      target_level_id: Number(data.target_level_id),
      assessors: data.assessors.map((id) => Number(id)),
    };

    onSubmit(transformedData);
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

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
              name="target_level_id"
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
                disabled={isSubmitting}
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
