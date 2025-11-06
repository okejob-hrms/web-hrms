"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useCompanyBranchDetails } from "./hook";
import AppSkeleton from "@/components/partials/app-skeleton";

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export default function SettingsCompanyBranchDetails() {
  const router = useRouter();
  const { data, isLoading, isError } = useCompanyBranchDetails();

  if (isLoading)
    return (
      <div className="font-sans md:px-[125px] px-4 space-y-4">
        <AppSkeleton />
      </div>
    );
  if (isError || !data) return <p>Failed to load company profile</p>;

  return (
    <div className="font-sans md:px-[125px] px-4 space-y-4">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <h2 className="font-semibold text-xl">Company Branch Information</h2>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-20 w-20">
              <AvatarImage src={data.logo_url || ""} alt="Company Logo" />
              <AvatarFallback className="bg-blue-50 text-blue-700">
                {data.name?.charAt(0) ?? "C"}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">{data.name}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
            <InfoItem label="Legal Entity" value={data.legal_entity_name} />
            <InfoItem
              label="Industry / Business Sector"
              value={data.industry}
            />
            <InfoItem label="Company Email Address" value={data.email} />
            <InfoItem label="Company Phone Number" value={data.phone} />
            <InfoItem
              label="Business Registration Number"
              value={data.business_registration_number}
            />
            <InfoItem label="Website (Optional)" value={data.website ?? "-"} />
            <div className="md:col-span-3">
              <InfoItem label="Company Address" value={data.address} />
            </div>
          </div>

          <h2 className="font-semibold text-xl">Payroll Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
            <InfoItem
              label="Bank Account Name"
              value={data.payroll_bank_account_name}
            />
            <InfoItem
              label="Bank Account Number"
              value={data.payroll_bank_account_number}
            />
            <InfoItem
              label="Bank Account Holder"
              value={data.payroll_bank_name}
            />
            <InfoItem label="Currency" value={data.payroll_currency} />
          </div>

          <div className="flex mt-4">
            <Button
              variant="outline"
              className="flex flex-row gap-6"
              onClick={() =>
                router.push(`/settings/company/company-branch/edit/${data.id}`)
              }
            >
              <Edit3 />
              Edit Branch
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
