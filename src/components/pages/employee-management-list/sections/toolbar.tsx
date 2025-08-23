/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Settings } from "lucide-react";
import * as React from "react";
import { MultiSelectForm } from "@/components/ui/multi-select";
import { Filters } from "../types";
import { AdvancedFilter } from "./advanced-filters";
import { useQuery } from "@tanstack/react-query";
import { getDepartment } from "@/services/department";
import { getJobPosition } from "@/services/job-position";
import { useForm, useWatch } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface ToolbarProps {
  onFiltersChange: (filters: Filters) => void;
}

export const Toolbar = React.memo(function Toolbar({
  onFiltersChange,
}: ToolbarProps) {
  const initValues = {
    department_ids: [],
    job_position_ids: [],
    search: "",
  };
  const [isAdvanced, setIsAdvanced] = React.useState(false);
  const form = useForm<Filters>({
    defaultValues: initValues,
    mode: "onChange",
  });

  const departmentIds = useWatch({
    control: form.control,
    name: "department_ids",
  });
  const jobPositionIds = useWatch({
    control: form.control,
    name: "job_position_ids",
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartment,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: positions } = useQuery({
    queryKey: ["job-position"],
    queryFn: getJobPosition,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const departmentOptions = React.useMemo(() => {
    if (departments?.data?.data) {
      return departments.data.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [departments?.data]);

  const positionOptions = React.useMemo(() => {
    if (positions?.data) {
      return positions.data.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      }));
    }
    return [];
  }, [positions?.data]);

  const debouncedSubmit = React.useRef<NodeJS.Timeout | null>(null);

  const onSubmit = React.useCallback(
    (values: Filters) => {
      console.log("Basic filter submit:", values);
      onFiltersChange({
        ...values,
        department_ids: values.department_ids?.flatMap((item) => Number(item)),
        job_position_ids: values.job_position_ids?.flatMap((item) =>
          Number(item),
        ),
      });
    },
    [onFiltersChange],
  );

  React.useEffect(() => {
    if (debouncedSubmit.current) {
      clearTimeout(debouncedSubmit.current);
    }

    if (form.formState.isDirty) {
      debouncedSubmit.current = setTimeout(() => {
        form.handleSubmit(onSubmit)();
      }, 300);
    }

    return () => {
      if (debouncedSubmit.current) {
        clearTimeout(debouncedSubmit.current);
      }
    };
  }, [departmentIds, jobPositionIds, form, onSubmit]);

  const handleAdvancedFilters = (filters: Filters) => {
    console.log("Advanced filters applied:", filters);
    onFiltersChange(filters);
  };

  const handleAdvancedReset = () => {
    setIsAdvanced(false);
    form.reset(initValues);
    onFiltersChange(initValues);
  };

  const handleSearchKeyPress = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        form.handleSubmit(onSubmit)();
      }
    },
    [form, onSubmit],
  );

  if (isAdvanced)
    return (
      <AdvancedFilter
        onReset={handleAdvancedReset}
        onApplyFilters={handleAdvancedFilters}
      />
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
          <InputForm
            name="search"
            placeholder="Search by Employee Name or ID"
            icon={<Search className="size-5 text-grayscale-20" />}
            iconPosition="right"
            onKeyDown={handleSearchKeyPress}
          />
          <Separator orientation="vertical" />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">Position</label>
            <MultiSelectForm
              placeholder="All Position"
              options={positionOptions}
              name="job_position_ids"
              maxCount={1}
              searchPlaceholder="Search Position"
              allSelectLabel="All Position"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">Department</label>
            <MultiSelectForm
              placeholder="All Department"
              options={departmentOptions}
              name="department_ids"
              maxCount={1}
              searchPlaceholder="Search Department"
              allSelectLabel="All Department"
            />
          </div>
          <Button
            variant="ghost"
            className="text-primary"
            type="button"
            onClick={() => setIsAdvanced(true)}
          >
            <Settings /> Advanced Search
          </Button>
        </div>
      </form>
    </Form>
  );
});
