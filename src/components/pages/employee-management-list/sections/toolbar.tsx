"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Settings } from "lucide-react";
import * as React from "react";
import { MultiSelect } from "@/components/ui/multi-select";
import { Filters } from "../types";
import { AdvancedFilter } from "./advanced-filters";

export const Toolbar = React.memo(function Toolbar() {
  const initValues = {
    department: [""],
    position: [""],
    name: "",
    startDate: new Date(),
    endDate: new Date(),
  };
  const [isAdvanced, setIsAdvanced] = React.useState(false);
  const [filters, setFilters] = React.useState<Filters>(initValues);

  console.log(filters);

  const handleChangeDepartment = (val: string[]) =>
    setFilters((prev) => ({ ...prev, department: val }));
  const handleChangePosition = (val: string[]) =>
    setFilters((prev) => ({ ...prev, position: val }));
  const handleChangeName = (event: React.ChangeEvent<HTMLInputElement>) =>
    setFilters((prev) => ({ ...prev, name: event.target.value }));

  if (isAdvanced)
    return (
      <AdvancedFilter
        onChangeDepartment={handleChangeDepartment}
        onChangePosition={handleChangePosition}
        onChangeName={handleChangeName}
        onReset={() => {
          setFilters(initValues);
          setIsAdvanced(false);
        }}
        onChangeStartDate={(val) =>
          setFilters((prev) => ({ ...prev, startDate: val }))
        }
        onChangeEndDate={(val) =>
          setFilters((prev) => ({ ...prev, endDate: val }))
        }
        filterData={filters}
      />
    );

  return (
    <div className="flex flex-col md:flex-row md:items-end gap-2 md:h-10">
      <Input
        placeholder="Search by Employee Name or ID"
        icon={<Search className="size-5 text-grayscale-20" />}
        iconPosition="right"
      />
      <Separator orientation="vertical" />
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
          onValueChange={handleChangePosition}
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
          onValueChange={handleChangeDepartment}
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
  );
});
