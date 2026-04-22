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
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getPerformanceCompetencies,
  getPerformanceCompetenciesDetail,
  getPerformanceCompetencyLevels,
} from "@/services/performance-competency";
import { TextAreaForm } from "@/components/ui/textarea";

const OPTIONS_PER_PAGE = "20";
const SCROLL_BOTTOM_THRESHOLD = 32;

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
    fetchNextPage: fetchNextCompetencyPage,
    hasNextPage: hasNextCompetencyPage,
    isFetchingNextPage: isFetchingNextCompetencyPage,
  } = useInfiniteQuery({
    queryKey: ["performance-competencies"],
    queryFn: ({ pageParam }) =>
      getPerformanceCompetencies({
        page: String(pageParam),
        per_page: OPTIONS_PER_PAGE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data;
      if (!pagination) return undefined;
      if (pagination.next_page_url) return pagination.current_page + 1;
      if (
        pagination.last_page &&
        pagination.current_page < pagination.last_page
      ) {
        return pagination.current_page + 1;
      }
      return undefined;
    },
  });

  const {
    data: levels,
    fetchNextPage: fetchNextLevelPage,
    hasNextPage: hasNextLevelPage,
    isFetchingNextPage: isFetchingNextLevelPage,
  } = useInfiniteQuery({
    queryKey: ["performance-levels", selectedCompetencyId, selectedDimension],
    queryFn: ({ pageParam }) =>
      getPerformanceCompetencyLevels({
        competency_id: selectedCompetencyId?.toString(),
        dimensions: selectedDimension,
        level: "",
        page: String(pageParam),
        per_page: OPTIONS_PER_PAGE,
      }),
    initialPageParam: 1,
    enabled: !!selectedCompetencyId && !!selectedDimension,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      if (lastPage.next_page_url) return lastPage.current_page + 1;
      if (lastPage.last_page && lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
  });

  const competencyOptions = React.useMemo(
    () =>
      performanceCompetencies?.pages.flatMap(
        (page) =>
          page?.data?.data?.map((item) => ({
            value: item.id.toString(),
            label: `[${item.code}] ${item.name}`,
          })) ?? [],
      ) ?? [],
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
      levels?.pages.flatMap(
        (page) =>
          page?.data?.map((item) => ({
            value: item.id.toString(),
            label: `[${item.level}] ${item.name}`,
          })) ?? [],
      ) ?? [],
    [levels],
  );

  const handleCompetencyScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const reachedBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight <
        SCROLL_BOTTOM_THRESHOLD;
      if (
        reachedBottom &&
        hasNextCompetencyPage &&
        !isFetchingNextCompetencyPage
      ) {
        fetchNextCompetencyPage();
      }
    },
    [
      hasNextCompetencyPage,
      isFetchingNextCompetencyPage,
      fetchNextCompetencyPage,
    ],
  );

  const handleLevelScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const reachedBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight <
        SCROLL_BOTTOM_THRESHOLD;
      if (reachedBottom && hasNextLevelPage && !isFetchingNextLevelPage) {
        fetchNextLevelPage();
      }
    },
    [hasNextLevelPage, isFetchingNextLevelPage, fetchNextLevelPage],
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

  const minValue = form.watch(`${fieldPrefix}.options.min`) || 1;
  const maxValue = form.watch(`${fieldPrefix}.options.max`) || 8;

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
                      <CommandList onScroll={handleCompetencyScroll}>
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
                          {isFetchingNextCompetencyPage && (
                            <div className="py-2 text-center text-xs text-muted-foreground">
                              Loading more...
                            </div>
                          )}
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
                <Popover open={levelOpen} onOpenChange={setLevelOpen}>
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
                      <CommandList onScroll={handleLevelScroll}>
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
                          {isFetchingNextLevelPage && (
                            <div className="py-2 text-center text-xs text-muted-foreground">
                              Loading more...
                            </div>
                          )}
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

      {watchedAnswerType === "range" && (
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
          <CustomForm groupIndex={groupIndex} fieldIndex={fieldIndex} />
        )}
      </div>
    );
  },
);
