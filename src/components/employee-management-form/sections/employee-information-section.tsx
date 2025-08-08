"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { SelectForm } from "@/components/ui/select-form";
import { DatePicker } from "@/components/ui/date-picker";

export const EmployeeinformationSection = React.memo(
  function EmployeeinformationSection() {
    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Employment Information
        </h2>
        <div className="grid grid-cols-2 gap-3 items-end">
          <SelectForm
            name="position"
            label="Position"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <SelectForm
            name="department"
            label="Department"
            options={[
              { label: "Engineering", value: "engineering" },
              { label: "Human Resource", value: "hrd" },
            ]}
            required
          />
          <SelectForm
            name="jobLevel"
            label="Job Level"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <SelectForm
            name="primaryDirectReport"
            label="Primary Direct Report"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <SelectForm
            name="additionalDirectReport"
            label="Additional Direct Report"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <SelectForm
            name="team"
            label="Team"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <DatePicker name="startDate" label="Employment Start Date" />
          <DatePicker name="endDate" label="Employment End Date" />
          <SelectForm
            name="status"
            label="Status"
            options={[
              { label: "Junio", value: "junior" },
              { label: "Middle", value: "middle" },
              { label: "Senior", value: "senior" },
              { label: "Supervisor", value: "supervisor" },
            ]}
            required
          />
          <Separator className="col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
