import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { SelectForm } from "@/components/ui/select-form";
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
  answerType?: string;
  onAnswerTypeChange?: (type: string) => void;
}

export const LibraryForm = React.memo(function LibraryForm({
  groupIndex,
  fieldIndex,
  answerType = "range",
  onAnswerTypeChange,
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

  const minValue = form.watch(`${fieldPrefix}.options.min`) || 1;
  const maxValue = form.watch(`${fieldPrefix}.options.max`) || 8;

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

      <SelectForm
        name={`${fieldPrefix}.type`}
        label="Answer Type"
        required
        options={[
          { label: "Range", value: "range" },
          { label: "Paragraph", value: "textarea" },
        ]}
        onChange={(e) => onAnswerTypeChange?.(e.target.value)}
      />

      {answerType === "range" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-normal">
            Range Configuration<span className="text-error">*</span>
          </p>
          <div className="flex gap-2 items-center">
            <Input
              className="w-20!"
              type="number"
              value={minValue}
              onChange={(e) =>
                form.setValue(
                  `${fieldPrefix}.options.min`,
                  Number(e.target.value),
                )
              }
            />
            <span>-</span>
            <Input
              className="w-20!"
              type="number"
              value={maxValue}
              onChange={(e) =>
                form.setValue(
                  `${fieldPrefix}.options.max`,
                  Number(e.target.value),
                )
              }
            />
          </div>
        </div>
      )}

      <InputForm
        name={`${fieldPrefix}.metadata.score_weight`}
        label="Score Weight"
        className="md:max-w-[116px]"
        type="number"
      />
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
  const form = useFormContext();
  const fieldPrefix =
    groupIndex !== undefined && fieldIndex !== undefined
      ? `groups.${groupIndex}.fields.${fieldIndex}`
      : "";

  const minValue = form.watch(`${fieldPrefix}.options.min`) || 1;
  const maxValue = form.watch(`${fieldPrefix}.options.max`) || 8;
  const answerType = form.watch(`${fieldPrefix}.type`);

  return (
    <div className="flex flex-col gap-4">
      <InputForm
        name={`${fieldPrefix}.label`}
        label="Aspect Name"
        placeholder="e.g., Work Environment"
      />

      <SelectForm
        name={`${fieldPrefix}.type`}
        label="Answer Type"
        required
        options={[
          { label: "Range", value: "range" },
          { label: "Paragraph", value: "textarea" },
        ]}
      />

      {answerType === "range" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-normal">
            Range Configuration<span className="text-error">*</span>
          </p>
          <div className="flex gap-2 items-center">
            <Input
              className="w-20!"
              type="number"
              value={minValue}
              onChange={(e) =>
                form.setValue(
                  `${fieldPrefix}.options.min`,
                  Number(e.target.value),
                )
              }
            />
            <span>-</span>
            <Input
              className="w-20!"
              type="number"
              value={maxValue}
              onChange={(e) =>
                form.setValue(
                  `${fieldPrefix}.options.max`,
                  Number(e.target.value),
                )
              }
            />
          </div>
        </div>
      )}

      <InputForm
        name={`${fieldPrefix}.metadata.score_weight`}
        label="Score Weight"
        className="md:max-w-[116px]"
        type="number"
      />
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
    const [selectedType, setSelectedType] = React.useState<string>(() => {
      const existingMetadataType = form.getValues(
        `groups.${groupIndex}.fields.${fieldIndex}.metadata.type`,
      );
      if (existingMetadataType === "use_competency_library") {
        return "library";
      } else if (existingMetadataType === "custom_aspect") {
        return "custom";
      }
      return "library";
    });

    const [answerType, setAnswerType] = React.useState<string>(() => {
      const existingType = form.getValues(
        `groups.${groupIndex}.fields.${fieldIndex}.type`,
      );
      return existingType || "range";
    });

    const competency_id = form.watch(
      `groups.${groupIndex}.fields.${fieldIndex}.metadata.competency_id`,
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

    const prevSelectedTypeRef = React.useRef(selectedType);
    const prevAnswerTypeRef = React.useRef(answerType);
    const prevCompetencyIdRef = React.useRef(competency_id);
    const prevLevelIdRef = React.useRef(level_id);

    React.useEffect(() => {
      if (groupIndex === undefined || fieldIndex === undefined) return;

      const fieldPrefix = `groups.${groupIndex}.fields.${fieldIndex}`;

      if (prevSelectedTypeRef.current !== selectedType) {
        const metadataType =
          selectedType === "library"
            ? "use_competency_library"
            : "custom_aspect";

        form.setValue(`${fieldPrefix}.metadata.type`, metadataType, {
          shouldValidate: false,
          shouldDirty: true,
        });
        prevSelectedTypeRef.current = selectedType;
      }

      if (prevAnswerTypeRef.current !== answerType) {
        form.setValue(`${fieldPrefix}.type`, answerType, {
          shouldValidate: false,
          shouldDirty: true,
        });

        if (answerType === "range") {
          const currentOptions = form.getValues(`${fieldPrefix}.options`);
          if (!currentOptions?.min || !currentOptions?.max) {
            form.setValue(
              `${fieldPrefix}.options`,
              { min: 1, max: 8 },
              { shouldValidate: false, shouldDirty: true },
            );
          }
        }
        prevAnswerTypeRef.current = answerType;
      }

      if (
        prevCompetencyIdRef.current !== competency_id &&
        selectedType === "library" &&
        competency_id
      ) {
        const label = competencyOptionsMap[competency_id] || "";
        form.setValue(`${fieldPrefix}.label`, label, {
          shouldValidate: false,
          shouldDirty: true,
        });
        prevCompetencyIdRef.current = competency_id;
      }

      if (
        prevLevelIdRef.current !== level_id &&
        level_id &&
        levelValueMap[level_id] !== undefined
      ) {
        const levelValue = levelValueMap[level_id];
        form.setValue(`${fieldPrefix}.metadata.level_value`, levelValue, {
          shouldValidate: false,
          shouldDirty: true,
        });
        prevLevelIdRef.current = level_id;
      }

      const currentScoreWeightType = form.getValues(
        `${fieldPrefix}.metadata.score_weight_type`,
      );
      if (!currentScoreWeightType) {
        form.setValue(`${fieldPrefix}.metadata.score_weight_type`, "percent", {
          shouldValidate: false,
        });
      }
    }, [
      selectedType,
      answerType,
      competency_id,
      level_id,
      groupIndex,
      fieldIndex,
      form,
      competencyOptionsMap,
      levelValueMap,
    ]);

    return (
      <div className="border border-grayscale-40 rounded-md p-4 space-y-4">
        <RadioGroup
          value={selectedType}
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
          <LibraryForm
            groupIndex={groupIndex}
            fieldIndex={fieldIndex}
            answerType={answerType}
            onAnswerTypeChange={setAnswerType}
          />
        )}
        {selectedType === "custom" && (
          <CustomForm
            groupIndex={groupIndex}
            fieldIndex={fieldIndex}
          />
        )}
      </div>
    );
  },
);
