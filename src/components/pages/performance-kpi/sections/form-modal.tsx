import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { SelectForm } from "@/components/ui/select-form";
import {
  IKPIDetails,
  IMutateKPIRequest,
} from "@/services/performances/kpi/types";
import * as React from "react";
import { useForm } from "react-hook-form";

interface IOption {
  label: string;
  value: string;
}

interface FormAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: IMutateKPIRequest) => void;
  frequencyOptions: IOption[];
  formatOptions: IOption[];
  jobPositionOptions: IOption[];
  jobLevelOptions: IOption[];
  aggregationOptions: IOption[];
  directionOptions: IOption[];
  kpiDetails?: IKPIDetails;
  editMode: boolean;
  isLoadingDetails?: boolean;
}

export default function FormModal({
  open,
  onOpenChange,
  onSave,
  frequencyOptions,
  formatOptions,
  jobPositionOptions,
  jobLevelOptions,
  aggregationOptions,
  directionOptions,
  kpiDetails,
  editMode,
  isLoadingDetails,
}: FormAddModalProps) {
  const form = useForm();

  // Prefill form when kpiDetails is loaded
  React.useEffect(() => {
    if (editMode && kpiDetails && open) {
      form.reset({
        name: kpiDetails.name || "",
        description: kpiDetails.description || "",
        frequency: kpiDetails.frequency?.toString() || "",
        format: kpiDetails.format?.toString() || "",
        job_position_id: kpiDetails.job_position_id?.toString() || "",
        job_level_id: kpiDetails.job_level_id?.toString() || "",
        target: kpiDetails.target?.toString() || "",
        direction: kpiDetails.direction?.toString() || "",
        aggregation: kpiDetails.aggregation?.toString() || "",
      });
    } else if (!editMode && open) {
      form.reset({
        name: "",
        description: "",
        frequency: "",
        format: "",
        job_position_id: "",
        job_level_id: "",
        target: "",
        direction: "",
        aggregation: "",
      });
    }
  }, [editMode, kpiDetails, open, form]);

  const handleSave = (): void => {
    const formData = form.getValues();
    const data: IMutateKPIRequest = {
      name: formData.name,
      description: formData.description,
      frequency: Number(formData.frequency),
      format: Number(formData.format),
      job_position_id: Number(formData.job_position_id),
      job_level_id: Number(formData.job_level_id),
      target: Number(formData.target),
      direction: Number(formData.direction),
      aggregation: Number(formData.aggregation),
    };
    onSave(data);
    handleClose();
  };

  const handleClose = (): void => {
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
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-semibold">
            {editMode ? "Edit KPI" : "Create New KPI"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="px-6 pb-6 space-y-5">
            <p className="font-semibold">KPI Information</p>
            <InputForm
              name="name"
              label="KPI Name"
              required
              className="w-full"
            />
            <InputForm
              name="description"
              label="Description"
              required
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
              <SelectForm
                name="frequency"
                label="Frequency"
                required
                options={frequencyOptions}
              />
              <SelectForm
                name="format"
                label="Format"
                required
                options={formatOptions}
              />
            </div>
            <SelectForm
              name="job_position_id"
              label="Job Position"
              required
              className="w-full"
              options={jobPositionOptions}
            />
            <SelectForm
              name="job_level_id"
              label="Job Level"
              required
              className="w-full"
              options={jobLevelOptions}
            />
            <p className="font-semibold">KPI Target</p>
            <InputForm
              name="target"
              label="Target"
              isOptional
              className="w-full"
            />
            <SelectForm
              name="direction"
              label="Direction"
              isOptional
              className="w-full"
              options={directionOptions}
            />
            <SelectForm
              name="aggregation"
              label="KPI Aggregation"
              required
              className="w-full"
              options={aggregationOptions}
            />
            <div className="flex md:flex-row flex-col md:justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="px-6 border-[#0e7490] text-[#0e7490] hover:bg-[#0e7490]/5"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isLoadingDetails && editMode}
                className="px-8 bg-[#0e7490] hover:bg-[#0c6380] text-white"
              >
                {editMode ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
