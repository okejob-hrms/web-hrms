/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { SelectForm } from "@/components/ui/select-form";
import { InputForm } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { getBankList } from "@/services/bank";

export const BankInformationSection = React.memo(
  function BankInformationSection() {
    const { data, isLoading, error } = useQuery({
      queryKey: ["bank"],
      queryFn: getBankList,
      retry: (failureCount, error: any) => {
        if (error?.response?.status >= 400) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

    const bankOptions = React.useMemo(() => {
      if (data?.data) {
        return data.data.map((item) => ({
          label: item.bank_name,
          value: item.id.toString(),
        }));
      }
      return [];
    }, [data?.data]);
    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Bank Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <SelectForm
            name="bank_id"
            label="Bank"
            options={bankOptions}
            required
            disabled={isLoading || !!error}
          />
          <InputForm
            name="account_number"
            label="Account Number"
            required
            className="col-start-1 col-end-2"
          />
          <InputForm name="account_name" label="Account Name" required />
          <Separator className="md:col-span-2 my-6" />
        </div>
      </React.Fragment>
    );
  },
);
