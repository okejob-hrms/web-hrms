/* eslint-disable @typescript-eslint/no-explicit-any */
import { MultiSelectForm } from "@/components/ui/multi-select";
import { AdvancedFilterProps, Filters } from "../types";
import * as React from "react";
import { RotateCcw, Search } from "lucide-react";
import { InputForm } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { getDepartment } from "@/services/department";
import { getJobPosition } from "@/services/job-position";
import { Form } from "@/components/ui/form";
import dayjs from "dayjs";

interface ExtendedAdvancedFilterProps extends AdvancedFilterProps {
  onApplyFilters: (filters: Filters) => void;
}

export const AdvancedFilter = React.memo(function AdvancedFilter({
  onReset,
  onApplyFilters,
}: ExtendedAdvancedFilterProps) {
  const initValues: Filters = {
    department_ids: [],
    job_position_ids: [],
    search: "",
    start_date: null,
    end_date: null,
  };
  const form = useForm<Filters>({
    defaultValues: initValues,
  });
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => getDepartment(),
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

  const onSubmit = (values: Filters) => {
    try {
      console.log("onSubmit ", values);
      const normalized: Filters = {
        ...values,
        department_ids:
          values.department_ids?.map((item) => Number(item)) || [],
        job_position_ids:
          values.job_position_ids?.map((item) => Number(item)) || [],
        start_date: values.start_date
          ? dayjs(values.start_date as unknown as Date).format("YYYY-MM-DD")
          : null,
        end_date: values.end_date
          ? dayjs(values.end_date as unknown as Date).format("YYYY-MM-DD")
          : null,
      };
      onApplyFilters(normalized);
    } catch (error) {
      console.error("Error applying advanced filters:", error);
    }
  };

  const handleCancel = () => {
    form.reset();
    // onApplyFilters?.(initValues);
    onReset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="bg-white border border-grayscale-20 p-4 flex flex-col gap-2 rounded-sm">
          <div className="flex justify-between w-full">
            <p className="text-sm font-semibold text-gray-900">
              Advanced Search
            </p>
            <Button
              variant="ghost"
              className="text-primary content-fit"
              type="button"
              onClick={() => form.reset()}
            >
              <RotateCcw /> Reset
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary" htmlFor="name">
                Employee Name or ID
              </label>
              <InputForm
                placeholder="Employee Name or ID"
                icon={<Search className="size-5 text-grayscale-20" />}
                iconPosition="right"
                name="search"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Position</label>
              <MultiSelectForm
                allSelectLabel="All Position"
                placeholder="All Position"
                searchPlaceholder="Search Position"
                options={positionOptions}
                maxCount={1}
                variant="inverted"
                name="job_position_ids"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Department</label>
              <MultiSelectForm
                allSelectLabel="All Department"
                options={departmentOptions}
                placeholder="All Department"
                name="department_ids"
                searchPlaceholder="Search Department"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm">Joined At</label>
              <div className="grid grid-cols-2 w-full gap-4">
                <DatePicker name="start_date" placeholder="From" />
                <DatePicker name="end_date" placeholder="End" />
              </div>
            </div>
          </div>
          <div className="flex gap-4 self-end">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Search
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
});
