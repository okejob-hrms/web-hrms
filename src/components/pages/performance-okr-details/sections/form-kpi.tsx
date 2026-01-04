import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { IOKRKeyResultRequest } from "@/services/okr/types";

interface IOption {
  label: string;
  value: string;
}

interface FormKpiProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<any>;
  onSave: (data: IOKRKeyResultRequest) => void;
  frequencyOptions: IOption[];
  formatOptions: IOption[];
  jobPositionOptions: IOption[];
  jobLevelOptions: IOption[];
  aggregationOptions: IOption[];
  directionOptions: IOption[];
  kpiOptions: IOption[];
  searchKPI?: string;
  onSearchKPIChange?: (value: string) => void;
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
  kpiOptions,
  searchKPI,
  onSearchKPIChange,
}: FormKpiProps) => {
  const handleSave = () => {
    const formData = form.getValues();
    const data: IOKRKeyResultRequest = {
      objective_id: formData.objective_id,
      title: formData.name,
      description: formData.description,
      frequency: Number(formData.frequency),
      format: Number(formData.format),
      job_position_id: formData.job_position_id,
      job_level_id: formData.job_level_id,
      target_value: Number(formData.target),
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                const [open, setOpen] = React.useState(false);
                const selectedItem = kpiOptions.find(
                  (option) => option.value === field.value?.toString(),
                );

                return (
                  <FormItem>
                    <FormLabel className="text-sm font-normal">
                      KPI Name<span className="text-error">*</span>
                    </FormLabel>
                    <FormControl>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between h-10"
                          >
                            {selectedItem ? (
                              <span className="text-foreground">
                                {selectedItem.label}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                Select KPI
                              </span>
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command filter={() => 1}>
                            <CommandInput
                              placeholder="Search KPI..."
                              value={searchKPI}
                              onValueChange={onSearchKPIChange}
                              className="h-9"
                            />
                            <CommandEmpty>No KPI found.</CommandEmpty>
                            <CommandList key={searchKPI}>
                              <CommandGroup>
                                {kpiOptions.map((item) => (
                                  <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={(currentValue) => {
                                      const selectedOption = kpiOptions.find(
                                        (option) =>
                                          option.label.toLowerCase() ===
                                          currentValue.toLowerCase(),
                                      );
                                      if (selectedOption) {
                                        field.onChange(selectedOption.value);
                                      }
                                      setOpen(false);
                                      if (onSearchKPIChange) {
                                        onSearchKPIChange("");
                                      }
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Check
                                      className={cn(
                                        "h-4 w-4",
                                        field.value === item.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span>{item.label}</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
              <SelectForm
                name="job_position_id"
                label="Job Position"
                required
                options={jobPositionOptions}
              />
              {/* <label className="text-sm text-text-secondary">
                Job Position<span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={jobPositionOptions}
                name="job_position_ids"
                maxCount={3}
                searchPlaceholder="Search Job Position"
                hideSelectAll
                valueTransformer={(value) => Number(value)}
              /> */}
            </div>
            <div className="flex flex-col gap-2">
              <SelectForm
                name="job_level_id"
                label="Job Level"
                required
                options={jobLevelOptions}
              />
              {/* <label className="text-sm text-text-secondary">
                Job Level<span className="text-error">*</span>
              </label>
              <MultiSelectForm
                options={jobLevelOptions}
                name="job_level_ids"
                maxCount={3}
                searchPlaceholder="Search Job Level"
                hideSelectAll
                valueTransformer={(value) => Number(value)}
              /> */}
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
