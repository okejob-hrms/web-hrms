"use client";

import { MultipleSelectForm, SelectFilter } from "@/components/ui/select-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Settings } from "lucide-react";
import * as React from "react";

export const Toolbar = React.memo(function Toolbar() {
  return (
    <div className="flex items-end gap-2 h-10">
      <Input
        placeholder="Search by Employee Name or ID"
        icon={<Search className="size-5 text-grayscale-20" />}
        iconPosition="right"
      />
      <Separator orientation="vertical" />
      <SelectFilter
        placeholder="All Position"
        label="Position"
        options={[
          { label: "Head", value: "head" },
          { label: "Team Lead", value: "team lead" },
          { label: "Senior", value: "senior" },
          { label: "Staff", value: "staff" },
        ]}
      />
      <MultipleSelectForm
        options={[
          { label: "All Department", value: "all" },
          { label: "Managerial", value: "managerial" },
          { label: "Engineering", value: "engineering" },
          { label: "Product Design", value: "product" },
          { label: "Human Resource and Development", value: "hrd" },
          { label: "Marketing", value: "marketing" },
        ]}
        placeholder="All Department"
      />
      <SelectFilter
        placeholder="All Department"
        label="Department"
        options={[
          { label: "All Department", value: "all" },
          { label: "Managerial", value: "managerial" },
          { label: "Engineering", value: "engineering" },
          { label: "Product Design", value: "product" },
          { label: "Human Resource and Development", value: "hrd" },
          { label: "Marketing", value: "marketing" },
        ]}
      />
      <Button variant="ghost" className="text-primary">
        <Settings /> Advanced Search
      </Button>
    </div>
  );
});
