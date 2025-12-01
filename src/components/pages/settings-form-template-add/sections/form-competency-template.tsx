import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { SelectForm } from "@/components/ui/select-form";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { InputForm, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import {
  getPerformanceCompetencies,
  getPerformanceCompetencyLevels,
} from "@/services/performance-competency";

interface LibraryFormProps {
  groupIndex?: number;
  fieldIndex?: number;
}

export const LibraryForm = React.memo(function LibraryForm({
  groupIndex,
  fieldIndex,
}: LibraryFormProps) {
  const form = useFormContext();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const { data: performanceCompetencies, isLoading: isLoadingCompetencies } =
    useQuery({
      queryKey: ["performance-competencies"],
      queryFn: () => getPerformanceCompetencies(),
    });

  const { data: levels, isLoading: isLoadingLevels } = useQuery({
    queryKey: ["performance-levels"],
    queryFn: () => getPerformanceCompetencyLevels(),
  });

  const competencyOptions = React.useMemo(
    () =>
      performanceCompetencies?.data?.data?.map((item) => ({
        value: item.id.toString(),
        label: `[${item.code}] ${item.name}`,
      })) || [],
    [performanceCompetencies],
  );

  const dimensionOptions = [
    {
      label: "A",
      value: "A",
    },
    {
      label: "B",
      value: "B",
    },
    {
      label: "C",
      value: "C",
    },
    {
      label: "D",
      value: "D",
    },
  ];

  const levelOptions = React.useMemo(
    () =>
      levels?.data?.data?.map((item) => ({
        value: item.id.toString(),
        label: `[${item.level}] ${item.name}`,
      })) || [],
    [levels],
  );

  const fieldPrefix =
    groupIndex !== undefined && fieldIndex !== undefined
      ? `groups.${groupIndex}.fields.${fieldIndex}`
      : "";

  const filteredCompetencyOptions = React.useMemo(() => {
    if (searchTerm === "") return competencyOptions;
    return competencyOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, competencyOptions]);

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={form.control}
        name={`${fieldPrefix}.metadata.competency_id`}
        render={({ field }) => {
          const selectedOption = competencyOptions.find(
            (option) => option.value === field.value?.toString(),
          );

          return (
            <FormItem>
              <FormLabel className="text-sm font-normal">Competency</FormLabel>
              <FormControl>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        "w-full justify-between h-10 font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <span className="truncate">
                        {selectedOption?.label || "Select competency"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command filter={() => 1}>
                      <CommandInput
                        placeholder="Search competency..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        className="h-9"
                      />
                      <CommandEmpty>No competency found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {filteredCompetencyOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={() => {
                                form.setValue(
                                  `${fieldPrefix}.metadata.competency_id`,
                                  Number(option.value),
                                );
                                setOpen(false);
                                setSearchTerm("");
                              }}
                            >
                              {option.label}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value?.toString() === option.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
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
      <SelectForm
        name={`${fieldPrefix}.metadata.dimension`}
        label="Dimension"
        options={dimensionOptions}
      />
      <SelectForm
        name={`${fieldPrefix}.metadata.level_id`}
        label="Level"
        options={levelOptions}
      />
      <InputForm
        name={`${fieldPrefix}.metadata.score_weight`}
        label="Score Weight"
        className="md:max-w-[116px]"
        type="number"
      />
      {/* <Button className="md:self-end">Save</Button> */}
    </div>
  );
});

interface CustomFormProps {
  groupIndex?: number;
  fieldIndex?: number;
}

export const CustomForm = React.memo(function CustomForm({
  groupIndex,
  fieldIndex,
}: CustomFormProps) {
  const fieldPrefix =
    groupIndex !== undefined && fieldIndex !== undefined
      ? `groups.${groupIndex}.fields.${fieldIndex}`
      : "";

  return (
    <div className="flex flex-col gap-4">
      <InputForm
        name={`${fieldPrefix}.label`}
        label="Aspect Name"
        placeholder="e.g., Work Environment"
      />
      <InputForm
        name={`${fieldPrefix}.metadata.score_weight`}
        label="Score Weight"
        className="md:max-w-[116px]"
        type="number"
      />
      <Button className="md:self-end">Save</Button>
    </div>
  );
});

interface FormCompetencyTemplateProps {
  groupIndex?: number;
  fieldIndex?: number;
  onRemove?: () => void;
}

export const FormCompetencyTemplate = React.memo(
  function FormCompetencyTemplate({
    groupIndex,
    fieldIndex,
    onRemove,
  }: FormCompetencyTemplateProps) {
    const form = useFormContext();
    const [selectedType, setSelectedType] = React.useState<string>("library");

    const competency_id = form.watch(
      `groups.${groupIndex}.fields.${fieldIndex}.metadata.competency_id`,
    );
    const dimension = form.watch(
      `groups.${groupIndex}.fields.${fieldIndex}.metadata.dimension`,
    );
    const level_id = form.watch(
      `groups.${groupIndex}.fields.${fieldIndex}.metadata.level_id`,
    );

    const competencyOptionsMap: Record<string, string> = {
      "1": "Compensation & Benefits",
      "2": "Communication",
      "3": "Decision Making",
      "4": "Initiative",
      "5": "Organization Orientation",
      "6": "Problem Solving",
      "7": "Relationship Management",
      "8": "Strategic Thinking",
    };

    const levelValueMap: Record<string, number> = {
      "1": -1,
      "2": 0,
      "3": 1,
      "4": 2,
      "5": 3,
    };

    React.useEffect(() => {
      if (groupIndex !== undefined && fieldIndex !== undefined) {
        let label = "";
        if (competency_id) {
          label = competencyOptionsMap[competency_id] || "";
        }

        const metadataType =
          selectedType === "library"
            ? "use_competency_library"
            : "custom_aspect";

        if (level_id && levelValueMap[level_id] !== undefined) {
          form.setValue(
            `groups.${groupIndex}.fields.${fieldIndex}.metadata.level_value`,
            levelValueMap[level_id],
          );
        }

        form.setValue(`groups.${groupIndex}.fields.${fieldIndex}.label`, label);
        form.setValue(
          `groups.${groupIndex}.fields.${fieldIndex}.type`,
          "range",
        );
        form.setValue(
          `groups.${groupIndex}.fields.${fieldIndex}.metadata.type`,
          metadataType,
        );
        form.setValue(`groups.${groupIndex}.fields.${fieldIndex}.options`, {
          min: 1,
          max: 8,
        });

        const currentScoreWeightType = form.getValues(
          `groups.${groupIndex}.fields.${fieldIndex}.metadata.score_weight_type`,
        );
        if (!currentScoreWeightType) {
          form.setValue(
            `groups.${groupIndex}.fields.${fieldIndex}.metadata.score_weight_type`,
            "percent",
          );
        }
      }
    }, [
      competency_id,
      dimension,
      level_id,
      selectedType,
      groupIndex,
      fieldIndex,
      form,
    ]);

    return (
      <div className="border border-grayscale-40 rounded-md p-4 space-y-4">
        <RadioGroup
          defaultValue="library"
          orientation="horizontal"
          onValueChange={(value) => setSelectedType(value)}
        >
          <div className="flex items-center gap-3">
            <RadioGroupItem
              value="library"
              id={`library-${groupIndex}-${fieldIndex}`}
            />
            <Label htmlFor={`library-${groupIndex}-${fieldIndex}`}>
              Use Competency Library
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <RadioGroupItem
              value="custom"
              id={`custom-${groupIndex}-${fieldIndex}`}
            />
            <Label htmlFor={`custom-${groupIndex}-${fieldIndex}`}>
              Customize Aspect
            </Label>
          </div>
        </RadioGroup>

        {selectedType === "library" && (
          <LibraryForm groupIndex={groupIndex} fieldIndex={fieldIndex} />
        )}
        {selectedType === "custom" && (
          <CustomForm groupIndex={groupIndex} fieldIndex={fieldIndex} />
        )}
      </div>
    );
  },
);
