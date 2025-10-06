"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { InputForm } from "@/components/ui/input";
import { SelectForm } from "@/components/ui/select-form";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { FormLabel } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { getAllowanceTypes } from "@/services/allowance-types";
import { useFormContext } from "react-hook-form";

export const SalaryInformationSection = React.memo(
  function SalaryInformation() {
    const { watch } = useFormContext();
    const [allowanceForm, setAllowanceForm] = React.useState(1);
    const watchedAllowances = watch("allowances");
    const { data: allowanceTypes } = useQuery({
      queryKey: ["allowances"],
      queryFn: getAllowanceTypes,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const allowanceTypesOptions = React.useMemo(() => {
      if (allowanceTypes?.data.data) {
        return allowanceTypes.data.data.map((item) => ({
          label: item.name,
          value: item.id.toString(),
        }));
      }
      return [];
    }, [allowanceTypes?.data]);
    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Salary Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <FormLabel className="text-base md:col-span-2 font-normal">
            Allowance<span className="text-text-disabled">(Optional)</span>
          </FormLabel>
          <InputForm
            name="base_salary"
            label="Base Salary"
            disabled
            required
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />
          <InputForm
            name="salary_nett"
            label="Salary (Nett)"
            required
            iconPosition="left"
            type="number"
            icon={<span className="text-text-disabled text-base">Rp</span>}
          />

          {allowanceForm > 0 &&
            [...Array(allowanceForm)].map((_, index) => (
              <div
                key={index}
                className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 w-full items-start"
              >
                <SelectForm
                  name={`allowances.${index}.allowance_type_id`}
                  label="Allowance Type"
                  options={allowanceTypesOptions}
                />
                <div className="flex gap-2 items-end">
                  <InputForm
                    name={`allowances.${index}.allowance_value`}
                    label="Allowance Value"
                    disabled={
                      watchedAllowances &&
                      !watchedAllowances[index]?.allowance_type_id
                    }
                    className="w-full"
                    iconPosition="left"
                    type="number"
                    icon={
                      <span className="text-text-disabled text-base">Rp</span>
                    }
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
          <Separator className="md:col-span-2 my-4" />
        </div>
      </React.Fragment>
    );
  },
);
