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
import Image from "next/image";
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
  getPerformanceCompetenciesDetail,
  getPerformanceCompetencyLevels,
} from "@/services/performance-competency";
import { TextAreaForm } from "@/components/ui/textarea";

const OPTIONS_PER_PAGE = "100";

const fetchAllCompetencies = async () => {
  const firstPage = await getPerformanceCompetencies({
    page: "1",
    per_page: OPTIONS_PER_PAGE,
  });
  const pagination = firstPage.data;
  const lastPage = pagination?.last_page ?? 1;
  if (lastPage <= 1) {
    return pagination?.data ?? [];
  }
  const remainingPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, i) =>
      getPerformanceCompetencies({
        page: String(i + 2),
        per_page: OPTIONS_PER_PAGE,
      }),
    ),
  );
  return [
    ...(pagination?.data ?? []),
    ...remainingPages.flatMap((page) => page?.data?.data ?? []),
  ];
};

const fetchAllLevels = async (
  competencyId: string,
  dimensions: string,
) => {
  const firstPage = await getPerformanceCompetencyLevels({
    competency_id: competencyId,
    dimensions,
    level: "",
    page: "1",
    per_page: OPTIONS_PER_PAGE,
  });
  const lastPage = firstPage?.last_page ?? 1;
  if (lastPage <= 1) {
    return firstPage?.data ?? [];
  }
  const remainingPages = await Promise.all(
    Array.from({ length: lastPage - 1 }, (_, i) =>
      getPerformanceCompetencyLevels({
        competency_id: competencyId,
        dimensions,
        level: "",
        page: String(i + 2),
        per_page: OPTIONS_PER_PAGE,
      }),
    ),
  );
  return [
    ...(firstPage?.data ?? []),
    ...remainingPages.flatMap((page) => page?.data ?? []),
  ];
};

interface RangeConfigurationProps {
  fieldPrefix: string;
}

const RangeConfiguration = React.memo(function RangeConfiguration({
  fieldPrefix,
}: RangeConfigurationProps) {
  const form = useFormContext();
  const minFromForm = form.watch(`${fieldPrefix}.options.min`);
  const maxFromForm = form.watch(`${fieldPrefix}.options.max`);

  const [minText, setMinText] = React.useState<string>(() =>
    minFromForm !== undefined && minFromForm !== null ? String(minFromForm) : "1",
  );
  const [maxText, setMaxText] = React.useState<string>(() =>
    maxFromForm !== undefined && maxFromForm !== null ? String(maxFromForm) : "8",
  );

  React.useEffect(() => {
    if (minFromForm !== undefined && minFromForm !== null) {
      const asString = String(minFromForm);
      setMinText((prev) => (Number(prev) === minFromForm ? prev : asString));
    }
  }, [minFromForm]);

  React.useEffect(() => {
    if (maxFromForm !== undefined && maxFromForm !== null) {
      const asString = String(maxFromForm);
      setMaxText((prev) => (Number(prev) === maxFromForm ? prev : asString));
    }
  }, [maxFromForm]);

  const commitValue = React.useCallback(
    (key: "min" | "max", text: string, fallback: number) => {
      const parsed = text.trim() === "" ? fallback : Number(text);
      const safe = Number.isFinite(parsed) ? parsed : fallback;
      form.setValue(`${fieldPrefix}.options.${key}`, safe, {
        shouldValidate: false,
        shouldDirty: true,
      });
      if (key === "min") {
        setMinText(String(safe));
      } else {
        setMaxText(String(safe));
      }
    },
    [fieldPrefix, form],
  );

  const handleChange = React.useCallback(
    (key: "min" | "max", text: string) => {
      if (key === "min") setMinText(text);
      else setMaxText(text);

      if (text.trim() === "") return;
      const parsed = Number(text);
      if (!Number.isFinite(parsed)) return;
      form.setValue(`${fieldPrefix}.options.${key}`, parsed, {
        shouldValidate: false,
        shouldDirty: true,
      });
    },
    [fieldPrefix, form],
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-normal">
        Range Configuration<span className="text-error">*</span>
      </p>
      <div className="flex gap-2 items-center">
        <Input
          className="w-20!"
          type="number"
          inputMode="numeric"
          value={minText}
          onChange={(e) => handleChange("min", e.target.value)}
          onBlur={() => commitValue("min", minText, 1)}
        />
        <span>-</span>
        <Input
          className="w-20!"
          type="number"
          inputMode="numeric"
          value={maxText}
          onChange={(e) => handleChange("max", e.target.value)}
          onBlur={() => commitValue("max", maxText, 8)}
        />
      </div>
    </div>
  );
});

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
  const [levelOpen, setLevelOpen] = React.useState(false);
  const [levelSearchTerm, setLevelSearchTerm] = React.useState("");
  const fieldPrefix =
    groupIndex !== undefined && fieldIndex !== undefined
      ? `groups.${groupIndex}.fields.${fieldIndex}`
      : "";
  const selectedCompetencyId = form.watch(
    `${fieldPrefix}.metadata.competency_id`,
  );
  const selectedDimension = form.watch(`${fieldPrefix}.metadata.dimension`);
  const watchedAnswerType = form.watch(`${fieldPrefix}.type`) || answerType;

  const {
    data: performanceCompetencies,
    refetch: refetchCompetencies,
  } = useQuery({
    queryKey: ["performance-competencies-all"],
    queryFn: fetchAllCompetencies,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const { data: levels, refetch: refetchLevels } = useQuery({
    queryKey: [
      "performance-levels-all",
      selectedCompetencyId,
      selectedDimension,
    ],
    queryFn: () =>
      fetchAllLevels(
        selectedCompetencyId?.toString() ?? "",
        selectedDimension ?? "",
      ),
    enabled: !!selectedCompetencyId && !!selectedDimension,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const competencyOptions = React.useMemo(
    () =>
      performanceCompetencies?.map((item) => ({
        value: item.id.toString(),
        label: `[${item.code}] ${item.name}`,
      })) ?? [],
    [performanceCompetencies],
  );

  const { data: competencyDetail } = useQuery({
    queryKey: ["performance-competency-detail", selectedCompetencyId],
    queryFn: () => getPerformanceCompetenciesDetail(Number(selectedCompetencyId)),
    enabled: !!selectedCompetencyId,
  });

  const dimensionOptions = React.useMemo(() => {
    const dimensions = competencyDetail?.data?.levels
      ?.map((item) => item.dimensions)
      .filter((value): value is string => !!value);
    const uniqueDimensions = Array.from(new Set(dimensions ?? [])).sort();
    return uniqueDimensions.map((dimension) => ({
      label: dimension,
      value: dimension,
    }));
  }, [competencyDetail]);

  const levelOptions = React.useMemo(
    () =>
      levels?.map((item) => ({
        value: item.id.toString(),
        label: `[${item.level}] ${item.name}`,
        level: item.level,
      })) ?? [],
    [levels],
  );

  const handleCompetencyOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);
      if (nextOpen) {
        refetchCompetencies();
      }
    },
    [refetchCompetencies],
  );

  const handleLevelOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      setLevelOpen(nextOpen);
      if (nextOpen && selectedCompetencyId && selectedDimension) {
        refetchLevels();
      }
    },
    [refetchLevels, selectedCompetencyId, selectedDimension],
  );

  const prevCompetencyIdRef = React.useRef(selectedCompetencyId);
  const prevDimensionRef = React.useRef(selectedDimension);

  React.useEffect(() => {
    if (
      (prevCompetencyIdRef.current !== selectedCompetencyId ||
        prevDimensionRef.current !== selectedDimension) &&
      fieldPrefix
    ) {
      form.setValue(`${fieldPrefix}.metadata.level_id`, undefined, {
        shouldValidate: false,
        shouldDirty: true,
      });
      if (prevCompetencyIdRef.current !== selectedCompetencyId) {
        form.setValue(`${fieldPrefix}.metadata.dimension`, undefined, {
          shouldValidate: false,
          shouldDirty: true,
        });
      }
      prevCompetencyIdRef.current = selectedCompetencyId;
      prevDimensionRef.current = selectedDimension;
    }
  }, [selectedCompetencyId, selectedDimension, fieldPrefix, form]);

  const filteredCompetencyOptions = React.useMemo(() => {
    if (searchTerm === "") return competencyOptions;
    return competencyOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, competencyOptions]);

  React.useEffect(() => {
    if (watchedAnswerType === "range" && fieldPrefix) {
      const currentOptions = form.getValues(`${fieldPrefix}.options`);
      if (!currentOptions?.min || !currentOptions?.max) {
        form.setValue(
          `${fieldPrefix}.options`,
          { min: 1, max: 8 },
          { shouldValidate: false, shouldDirty: true },
        );
      }
    }
  }, [watchedAnswerType, fieldPrefix, form]);

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
                <Popover open={open} onOpenChange={handleCompetencyOpenChange}>
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
                                form.setValue(
                                  `${fieldPrefix}.label`,
                                  option.label,
                                  { shouldValidate: true, shouldDirty: true },
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
      <FormField
        control={form.control}
        name={`${fieldPrefix}.metadata.level_id`}
        render={({ field }) => {
          const selectedOption = levelOptions.find(
            (option) => option.value === field.value?.toString(),
          );
          const filteredLevelOptions =
            levelSearchTerm === ""
              ? levelOptions
              : levelOptions.filter((option) =>
                  option.label
                    .toLowerCase()
                    .includes(levelSearchTerm.toLowerCase()),
                );
          const disabled = !selectedCompetencyId || !selectedDimension;

          return (
            <FormItem>
              <FormLabel className="text-sm font-normal">Level</FormLabel>
              <FormControl>
                <Popover open={levelOpen} onOpenChange={handleLevelOpenChange}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={levelOpen}
                      disabled={disabled}
                      className={cn(
                        "w-full justify-between h-10 font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <span className="truncate">
                        {selectedOption?.label || "Select level"}
                      </span>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command filter={() => 1}>
                      <CommandInput
                        placeholder="Search level..."
                        value={levelSearchTerm}
                        onValueChange={setLevelSearchTerm}
                        className="h-9"
                      />
                      <CommandEmpty>No level found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {filteredLevelOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={() => {
                                form.setValue(
                                  `${fieldPrefix}.metadata.level_id`,
                                  Number(option.value),
                                );
                                form.setValue(
                                  `${fieldPrefix}.metadata.level_value`,
                                  Number(option.level),
                                  { shouldValidate: true, shouldDirty: true },
                                );
                                setLevelOpen(false);
                                setLevelSearchTerm("");
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
        name={`${fieldPrefix}.type`}
        label="Answer Type"
        required
        options={[
          { label: "Range", value: "range" },
          { label: "Paragraph", value: "textarea" },
        ]}
        onChange={(e) => onAnswerTypeChange?.(e.target.value)}
      />

      {watchedAnswerType === "range" && fieldPrefix && (
        <RangeConfiguration fieldPrefix={fieldPrefix} />
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

  const answerType = form.watch(`${fieldPrefix}.type`);

  React.useEffect(() => {
    if (answerType === "range" && fieldPrefix) {
      const currentOptions = form.getValues(`${fieldPrefix}.options`);
      if (!currentOptions?.min || !currentOptions?.max) {
        form.setValue(
          `${fieldPrefix}.options`,
          { min: 1, max: 8 },
          { shouldValidate: false, shouldDirty: true },
        );
      }
    }
  }, [answerType, fieldPrefix, form]);

  return (
    <div className="flex flex-col gap-4">
      <InputForm
        name={`${fieldPrefix}.label`}
        label="Aspect Name"
        placeholder="e.g., Work Environment"
      />
      <TextAreaForm
        name={`${fieldPrefix}.description`}
        label="Description"
        placeholder="e.g., Work Environment"
        isOptional
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

      {answerType === "range" && fieldPrefix && (
        <RangeConfiguration fieldPrefix={fieldPrefix} />
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

    const prevSelectedTypeRef = React.useRef<string | null>(null);
    const prevAnswerTypeRef = React.useRef<string | null>(null);

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

      const currentScoreWeightType = form.getValues(
        `${fieldPrefix}.metadata.score_weight_type`,
      );
      if (!currentScoreWeightType) {
        form.setValue(`${fieldPrefix}.metadata.score_weight_type`, "percent", {
          shouldValidate: false,
        });
      }
    }, [selectedType, answerType, groupIndex, fieldIndex, form]);

    return (
      <div className="relative border border-grayscale-40 rounded-md p-4 space-y-4">
        {onRemove && (
          <Button
            variant="ghost"
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 z-10"
            aria-label="Remove question"
          >
            <Image
              width={16}
              height={16}
              src="/icons/deleteOutlined.svg"
              alt="trash"
            />
          </Button>
        )}
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
          <CustomForm groupIndex={groupIndex} fieldIndex={fieldIndex} />
        )}
      </div>
    );
  },
);
