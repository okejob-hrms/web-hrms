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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDepartment } from "@/services/department";
import { getJobPosition } from "@/services/job-position";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import dayjs from "dayjs";

interface ToolbarProps {
  onFiltersChange?: (filters: Filters) => void;
}

export const Toolbar = React.memo(function Toolbar({
  onFiltersChange,
}: ToolbarProps) {
  const initValues = {
    department: [""],
    position: [""],
    search: "",
    start_date: dayjs().format("DD-MM-YYYY"),
    end_date: dayjs().format("DD-MM-YYYY"),
  };
  const [isAdvanced, setIsAdvanced] = React.useState(false);
  const form = useForm<Filters>({
    defaultValues: initValues,
  });
  const queryClient = useQueryClient();
  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    error: departmentsError,
  } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartment,
    retry: (failureCount, error: any) => {
      if (error?.response?.status >= 400) return false;
      return failureCount < 3;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: positions,
    isLoading: isPositionsLoading,
    error: positionsError,
  } = useQuery({
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
        value: item.name,
      }));
    }
    return [];
  }, [departments?.data]);

  const positionOptions = React.useMemo(() => {
    if (positions?.data) {
      return positions.data.map((item) => ({
        label: item.name,
        value: item.name,
      }));
    }
    return [];
  }, [positions?.data]);

  const onSubmit = (values: Filters) => {
    console.log("Basic filter submit:", values);
    onFiltersChange?.(values);
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  const handleAdvancedFilters = (filters: Filters) => {
    console.log("Advanced filters applied:", filters);
    onFiltersChange?.(filters);
  };

  const handleAdvancedReset = () => {
    setIsAdvanced(false);
    // Reset filters to initial values
    onFiltersChange?.(initValues);
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  if (isAdvanced)
    return (
      <AdvancedFilter
        onReset={() => {
          setIsAdvanced(false);
        }}
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
          />
          <Separator orientation="vertical" />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">Position</label>
            <MultiSelectForm
              placeholder="All Position"
              options={[
                { label: "Head", value: "head" },
                { label: "Team Lead", value: "team lead" },
                { label: "Senior", value: "senior" },
                { label: "Staff", value: "staff" },
              ]}
              // options={positionOptions}
              name="position"
              maxCount={1}
              // variant="inverted"
              searchPlaceholder="Search Position"
              allSelectLabel="All Position"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-text-secondary">Department</label>
            <MultiSelectForm
              options={[
                { label: "Managerial", value: "managerial" },
                { label: "Engineering", value: "engineering" },
                { label: "Product Design", value: "product" },
                { label: "Human Resource and Development", value: "hrd" },
                { label: "Marketing", value: "marketing" },
              ]}
              placeholder="All Department"
              // options={departmentOptions}
              name="department"
              maxCount={1}
              // variant="inverted"
              searchPlaceholder="Search Department"
              allSelectLabel="All Department"
            />
          </div>
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() => setIsAdvanced(true)}
          >
            <Settings /> Advanced Search
          </Button>
        </div>
      </form>
    </Form>
  );
});
