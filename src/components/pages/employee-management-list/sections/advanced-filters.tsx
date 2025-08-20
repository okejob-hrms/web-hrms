/* eslint-disable @typescript-eslint/no-explicit-any */
import { MultiSelectForm } from "@/components/ui/multi-select";
import { AdvancedFilterProps, Filters } from "../types";
import * as React from "react";
import { RotateCcw, Search } from "lucide-react";
import { InputForm } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDepartment } from "@/services/department";
import { getJobPosition } from "@/services/job-position";
import { Form } from "@/components/ui/form";
import dayjs from "dayjs";

interface ExtendedAdvancedFilterProps extends AdvancedFilterProps {
  onApplyFilters?: (filters: Filters) => void;
}

export const AdvancedFilter = React.memo(function AdvancedFilter({
  onReset,
  onApplyFilters,
}: ExtendedAdvancedFilterProps) {
  const queryClient = useQueryClient();
  const initValues: Filters = {
    department: [""],
    position: [""],
    search: "",
    start_date: null,
    end_date: null,
  };
  const form = useForm<Filters>({
    defaultValues: initValues,
  });
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
    console.log("onSubmit ", values);
    onApplyFilters?.(values);
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  const handleReset = () => {
    form.reset();
    onApplyFilters?.(initValues);
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
              onClick={handleReset}
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
                name="name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Position</label>
              <MultiSelectForm
                allSelectLabel="All Position"
                placeholder="All Position"
                searchPlaceholder="Search Position"
                options={[
                  { label: "Head", value: "head" },
                  { label: "Team Lead", value: "team lead" },
                  { label: "Senior", value: "senior" },
                  { label: "Staff", value: "staff" },
                ]}
                maxCount={1}
                variant="inverted"
                name="position"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">Department</label>
              <MultiSelectForm
                allSelectLabel="All Department"
                options={[
                  { label: "Managerial", value: "managerial" },
                  { label: "Engineering", value: "engineering" },
                  { label: "Product Design", value: "product" },
                  { label: "Human Resource and Development", value: "hrd" },
                  { label: "Marketing", value: "marketing" },
                ]}
                placeholder="All Department"
                name="department"
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
            <Button variant="outline" onClick={() => form.reset()}>
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
