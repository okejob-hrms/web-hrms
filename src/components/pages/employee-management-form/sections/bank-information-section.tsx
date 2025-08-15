"use client";

import { Separator } from "@/components/ui/separator";
import * as React from "react";
import { SelectForm } from "@/components/ui/select-form";
import { InputForm } from "@/components/ui/input";

export const BankInformationSection = React.memo(
  function BankInformationSection() {
    return (
      <React.Fragment>
        <h2 className="font-semibold text-lg leading-5 mb-3">
          Bank Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <SelectForm
            name="bank"
            label="Bank"
            options={[
              { label: "BCA", value: "bca" },
              { label: "BRI", value: "bri" },
              { label: "Bank Mandiri", value: "mandiri" },
              { label: "Bank CIMB", value: "cimb" },
              { label: "BTN", value: "btn" },
            ]}
            required
          />
          <InputForm
            name="accountNumber"
            label="Account Number"
            required
            className="col-start-1 col-end-2"
          />
          <InputForm name="accountName" label="Account Name" required />
          <Separator className="md:col-span-2 my-6" />
        </div>
      </React.Fragment>
    );
  },
);
