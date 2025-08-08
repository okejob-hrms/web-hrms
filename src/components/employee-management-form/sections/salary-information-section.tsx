"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { InputForm } from "@/components/ui/input";
import { SelectForm } from "@/components/ui/select-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { FormLabel } from "@/components/ui/form";

export const SalaryInformationSection = React.memo(
  function SalaryInformation() {
    const [allowanceForm, setAllowanceForm] = React.useState(1);
    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Salary Information
        </h2>
        <div className="grid grid-cols-2 gap-3 items-end">
          <FormLabel className="text-base col-span-2 font-normal">
            Allowance<span className="text-text-disabled">(Optional)</span>
          </FormLabel>
          <InputForm name="baseSalary" label="Base Salary" disabled required />
          <InputForm name="nettSalary" label="Salary (Nett)" required />

          {allowanceForm > 0 &&
            [...Array(allowanceForm)].map((item) => (
              <div
                key={item}
                className="col-span-2 grid grid-cols-2 gap-3 w-full"
              >
                <SelectForm
                  name="allowanceType"
                  label="Allowance Type"
                  options={[
                    { label: "Single", value: "single" },
                    { label: "Married", value: "married" },
                    { label: "Divorced", value: "divorced" },
                    { label: "Widowed", value: "widowed" },
                    { label: "Separated", value: "separated" },
                  ]}
                  required
                />
                <div className="flex gap-2 items-end">
                  <InputForm
                    name="allowanceValue"
                    label="Allowance Value"
                    disabled
                    required
                    className="w-full"
                  />
                  <Button
                    variant="ghost"
                    className="w-fit"
                    onClick={() => setAllowanceForm((prev) => prev - 1)}
                  >
                    <Trash />
                  </Button>
                </div>
              </div>
            ))}
          <Button
            variant="ghost"
            className="w-fit text-primary"
            type="button"
            onClick={() => setAllowanceForm((prev) => prev + 1)}
          >
            <Plus /> Add Allowance
          </Button>
          <Separator className="col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
