"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  CircleCheckBigIcon,
  CircleXIcon,
  Clock4Icon,
  XCircle,
} from "lucide-react";
import { PaginationState } from "@tanstack/react-table";

import { Form } from "@/components/ui/form";
import { BasicDateRangePicker } from "@/components/ui/date-picker";
import { ComboboxForm } from "@/components/ui/combobox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { getEmployees } from "@/services/employees";
import { useTranslations } from "next-intl";

import { BusinessTripFilters } from "../types";

interface Props {
  filters: BusinessTripFilters;
  setFilters: (
    filters:
      | BusinessTripFilters
      | ((prev: BusinessTripFilters) => BusinessTripFilters),
  ) => void;
  setPagination: (
    pagination: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
}

const tabs = [
  { name: "All", value: "all", icon: <Clock4Icon /> },
  { name: "Waiting", value: 0, icon: <Clock4Icon /> },
  { name: "Approved", value: 1, icon: <CircleCheckBigIcon /> },
  { name: "Rejected", value: 2, icon: <CircleXIcon /> },
  { name: "Cancelled", value: 3, icon: <XCircle /> },
];

interface FormValues {
  user_id?: number | null;
}

export default function BusinessTripFiltersSection({
  filters,
  setFilters,
  setPagination,
}: Props) {
  const tCommon = useTranslations("common");
  const form = useForm<FormValues>({
    defaultValues: {
      user_id: null,
    },
  });

  const [employeeSearch, setEmployeeSearch] = React.useState("");
  const debouncedSearch = useDebounce(employeeSearch, 400);

  const dateRangeValue = React.useMemo(() => {
    if (!filters.start_date && !filters.end_date) return undefined;
    return {
      from: filters.start_date ? dayjs(filters.start_date).toDate() : undefined,
      to: filters.end_date ? dayjs(filters.end_date).toDate() : undefined,
    };
  }, [filters.start_date, filters.end_date]);

  const { data: employeesData } = useQuery({
    queryKey: ["business-trips-employee-options", debouncedSearch],
    queryFn: () =>
      getEmployees(
        debouncedSearch
          ? { search: debouncedSearch, per_page: 100 }
          : { per_page: 100 },
      ),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const employeeOptions = React.useMemo(() => {
    return (
      employeesData?.data?.data?.map((item) => ({
        label: item.name,
        value: String(item.user_id ?? item.id),
      })) ?? []
    );
  }, [employeesData]);

  const userIdValue = form.watch("user_id");

  React.useEffect(() => {
    const numeric =
      userIdValue === null || userIdValue === undefined
        ? undefined
        : Number(userIdValue);

    if (numeric !== filters.user_id) {
      setFilters((prev) => ({ ...prev, user_id: numeric }));
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [userIdValue]);

  return (
    <div className="flex flex-col justify-between gap-4">
      <Tabs
        value={filters.status === undefined ? "all" : String(filters.status)}
        className="w-full mx-auto"
        onValueChange={(value) => {
          const status = value === "all" ? undefined : Number(value);
          setFilters((prev) => ({ ...prev, status }));
          setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        }}
      >
        <TabsList className="p-1 w-full bg-secondary-background min-h-12">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={String(tab.value)}
              className={cn(
                "px-2.5 sm:px-3 text-secondary-hover",
                "data-[state=active]:bg-secondary data-[state=active]:text-white",
              )}
            >
              <code className="flex items-center gap-1 text-[13px] [&>svg]:h-4 [&>svg]:w-4">
                {tab.icon} {tab.name}
              </code>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Form {...form}>
        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:items-end"
          onSubmit={(e) => e.preventDefault()}
        >
          <BasicDateRangePicker
            label={tCommon("date")}
            isOptional
            className="min-w-65"
            value={dateRangeValue}
            onSelect={(range) => {
              setFilters((prev) => ({
                ...prev,
                start_date: range?.from
                  ? dayjs(range.from).format("YYYY-MM-DD")
                  : "",
                end_date: range?.to
                  ? dayjs(range.to).format("YYYY-MM-DD")
                  : "",
              }));
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
          />

          <ComboboxForm
            name="user_id"
            label="Employee"
            isOptional
            placeholder="Select employee"
            valueType="number"
            options={employeeOptions}
            searchValue={employeeSearch}
            onSearchChange={setEmployeeSearch}
          />
        </form>
      </Form>

      <Separator />
    </div>
  );
}
