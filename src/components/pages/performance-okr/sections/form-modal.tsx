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
import { MultiSelectForm } from "@/components/ui/multi-select";
import {
  IKPIDetails,
  IMutateKPIRequest,
} from "@/services/performances/kpi/types";
import * as React from "react";
import { useForm } from "react-hook-form";
import { DatePicker } from "@/components/ui/date-picker";

interface IOption {
  label: string;
  value: string;
}

interface FormAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: IMutateKPIRequest) => void;
  periodOptions: IOption[];
  editMode: boolean;
  isLoadingDetails?: boolean;
}

export default function FormModal({
  open,
  onOpenChange,
  onSave,
  periodOptions,
  editMode,
  isLoadingDetails,
}: FormAddModalProps) {
  const form = useForm();

  // React.useEffect(() => {
  //   if (editMode && kpiDetails && open) {
  //     form.reset({
  //       name: kpiDetails.name || "",
  //       description: kpiDetails.description || "",
  //       frequency: kpiDetails.frequency?.toString() || "",
  //       format: kpiDetails.format?.toString() || "",
  //       job_position_ids: kpiDetails.job_position_ids || [],
  //       job_level_ids: kpiDetails.job_level_ids || [],
  //       target: kpiDetails.target?.toString() || "",
  //       direction: kpiDetails.direction?.toString() || "",
  //       aggregation: kpiDetails.aggregation?.toString() || "",
  //     });
  //   } else if (!editMode && open) {
  //     form.reset({
  //       name: "",
  //       description: "",
  //       frequency: "",
  //       format: "",
  //       job_position_ids: [],
  //       job_level_ids: [],
  //       target: "",
  //       direction: "",
  //       aggregation: "",
  //     });
  //   }
  // }, [editMode, kpiDetails, open, form]);

  const handleSave = (): void => {
    const formData = form.getValues();
    const data: IMutateKPIRequest = {
      name: formData.name,
      description: formData.description,
      frequency: Number(formData.frequency),
      format: Number(formData.format),
      job_position_ids: formData.job_position_ids,
      job_level_ids: formData.job_level_ids,
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
            {editMode ? "Edit OKR Cycle" : "New OKR Cycle"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="px-6 pb-6 space-y-5 grid grid-cols-1 md:grid-cols-2 gap-2">
            <SelectForm
              name="period"
              label="Period"
              required
              options={periodOptions}
            />
            <InputForm name="year" label="Year" required />
            <DatePicker name="start_date" label="Start Date" />
            <DatePicker name="end_date" label="End Date" />
            <div className="flex md:flex-row flex-col md:justify-end gap-3 pt-2 md:col-span-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isLoadingDetails && editMode}
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
