import { MultiSelect } from "@/components/ui/multi-select";
import { AdvancedFilterProps } from "../types";
import * as React from "react";
import { RotateCcw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BasicDatePicker } from "@/components/ui/date-picker";

export const AdvancedFilter = React.memo(function AdvancedFilter({
  onChangePosition,
  onChangeDepartment,
  onChangeName,
  onChangeStartDate,
  onChangeEndDate,
  onReset,
  filterData,
}: AdvancedFilterProps) {
  return (
    <div className="bg-white border border-grayscale-20 p-4 flex flex-col gap-2 rounded-sm">
      <div className="flex justify-between w-full">
        <p className="text-sm font-semibold text-gray-900">Advanced Search</p>
        <Button
          variant="ghost"
          className="text-primary content-fit"
          onClick={onReset}
        >
          <RotateCcw /> Reset
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-secondary" htmlFor="name">
            Employee Name or ID
          </label>
          <Input
            placeholder="Employee Name or ID"
            icon={<Search className="size-5 text-grayscale-20" />}
            iconPosition="right"
            onChange={onChangeName}
            id="name"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-secondary">Position</label>
          <MultiSelect
            placeholder="All Position"
            options={[
              { label: "Head", value: "head" },
              { label: "Team Lead", value: "team lead" },
              { label: "Senior", value: "senior" },
              { label: "Staff", value: "staff" },
            ]}
            onValueChange={onChangePosition}
            maxCount={1}
            variant="inverted"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-text-secondary">Department</label>
          <MultiSelect
            options={[
              { label: "All Department", value: "all" },
              { label: "Managerial", value: "managerial" },
              { label: "Engineering", value: "engineering" },
              { label: "Product Design", value: "product" },
              { label: "Human Resource and Development", value: "hrd" },
              { label: "Marketing", value: "marketing" },
            ]}
            placeholder="All Department"
            onValueChange={onChangeDepartment}
          />
        </div>
        <BasicDatePicker
          value={filterData.startDate}
          onSelect={(val) => val && onChangeStartDate(val)}
        />
        <BasicDatePicker
          value={filterData.endDate}
          onSelect={(val) => val && onChangeEndDate(val)}
        />
      </div>
    </div>
  );
});
