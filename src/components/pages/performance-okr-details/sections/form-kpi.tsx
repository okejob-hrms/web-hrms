import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputForm } from "@/components/ui/input";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { SelectForm } from "@/components/ui/select-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { IMutateKPIRequest } from "@/services/performances/kpi/types";
import { UseFormReturn } from "react-hook-form";

interface IOption {
  label: string;
  value: string;
}

interface FormKpiProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<any>;
  onSave: (data: IMutateKPIRequest) => void;
  frequencyOptions: IOption[];
  formatOptions: IOption[];
  jobPositionOptions: IOption[];
  jobLevelOptions: IOption[];
  aggregationOptions: IOption[];
  directionOptions: IOption[];
}

export const FormKpi = ({
  open,
  onOpenChange,
  form,
  onSave,
  frequencyOptions,
  formatOptions,
  jobPositionOptions,
  jobLevelOptions,
  aggregationOptions,
  directionOptions,
}: FormKpiProps) => {
  const handleSave = () => {
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
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-[600px] w-full bg-white p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <SheetTitle>Key Result</SheetTitle>
          <SheetDescription>Add new key result</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form className="px-6 pb-6 space-y-5">
            <p className="font-semibold">Key Result Information</p>
            <InputForm
              name="name"
              label="Key Result Name"
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
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                Job Position<span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={jobPositionOptions}
                name="job_position_ids"
                maxCount={3}
                searchPlaceholder="Search Job Position"
                hideSelectAll
                valueTransformer={(value) => Number(value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">
                Job Level<span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={jobLevelOptions}
                name="job_level_ids"
                maxCount={3}
                searchPlaceholder="Search Job Level"
                hideSelectAll
                valueTransformer={(value) => Number(value)}
              />
            </div>
            <p className="font-semibold">Key Result Target</p>
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
              label="Key Result Aggregation"
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
                className="px-8 bg-[#0e7490] hover:bg-[#0c6380] text-white"
              >
                Create
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
