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
import { useTranslations } from "next-intl";

interface ExtendedAdvancedFilterProps extends AdvancedFilterProps {
  onApplyFilters: (filters: Filters) => void;
}

export const AdvancedFilter = React.memo(function AdvancedFilter({
  onReset,
  onApplyFilters,
}: ExtendedAdvancedFilterProps) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const initValues: Filters = {
    department_id: 0,
    job_position_id: 0,
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
        department_id: values.department_id,
        job_position_id: values.job_position_id,
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
              {t("advancedSearch")}
            </p>
            <Button
              variant="ghost"
              className="text-primary content-fit"
              type="button"
              onClick={() => form.reset()}
            >
              <RotateCcw /> {tCommon("reset")}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary" htmlFor="name">
                {t("employeeNameOrId")}
              </label>
              <InputForm
                placeholder={t("employeeNameOrId")}
                icon={<Search className="size-5 text-grayscale-20" />}
                iconPosition="right"
                name="search"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">{tCommon("position")}</label>
              <MultiSelectForm
                allSelectLabel={t("allPosition")}
                placeholder={t("allPosition")}
                searchPlaceholder={t("searchPosition")}
                options={positionOptions}
                maxCount={1}
                variant="inverted"
                name="job_position_id"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-text-secondary">{tCommon("department")}</label>
              <MultiSelectForm
                allSelectLabel={t("allDepartment")}
                options={departmentOptions}
                placeholder={t("allDepartment")}
                name="department_id"
                searchPlaceholder={t("searchDepartment")}
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm">{t("joinedAt")}</label>
              <div className="grid grid-cols-2 w-full gap-4">
                <DatePicker name="start_date" placeholder={t("from")} />
                <DatePicker name="end_date" placeholder={t("to")} />
              </div>
            </div>
          </div>
          <div className="flex gap-4 self-end">
            <Button variant="outline" type="button" onClick={handleCancel}>
              {tCommon("cancel")}
            </Button>
            <Button variant="default" type="submit">
              {tCommon("search")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
});
