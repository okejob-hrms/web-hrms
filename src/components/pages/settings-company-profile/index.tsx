"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
// import { DataTable } from '@/components/tables/data-table';
// import { ColumnDef } from '@tanstack/react-table';
// import { useIsMobile } from '@/hooks/use-mobile';
import { Edit3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useCompanyProfile } from "./hook";

// =======================
// Table Columns
// =======================
// const columns: ColumnDef<WorkingHour>[] = [
//   {
//     id: 'day',
//     header: 'Day',
//     size: 160,
//     cell: ({ row, table }) => {
//       const day = row.original.day;

//       // semua row di tabel
//       const allRows = table.getRowModel().rows;
//       // filter row yang sama harinya
//       const sameDayRows = allRows.filter((r) => r.original.day === day);

//       const firstRowId = sameDayRows[0].id;

//       if (row.id === firstRowId) {
//         return (
//           <td rowSpan={sameDayRows.length} className="px-4 py-2">
//             {day}
//           </td>
//         );
//       }

//       return null; // biarin kosong, rowSpan sudah cover
//     },
//   },
//   { accessorKey: 'shift', header: 'Shift', size: 160 },
//   { accessorKey: 'workingHours', header: 'Working Hours', size: 200 },
//   { accessorKey: 'break', header: 'Break', size: 160 },
// ];

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export default function SettingsCompanyProfile() {
  const router = useRouter();
  const { data, isLoading, isError } = useCompanyProfile();

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data) return <p>Failed to load company profile</p>;

  const { companyInfo, payrollInfo } = data;

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <h2 className="font-semibold text-xl">Company Information</h2>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={companyInfo.logo_url || ""}
                alt="Company Logo"
              />
              <AvatarFallback className="bg-blue-50 text-blue-700">
                {companyInfo.name?.charAt(0) ?? "C"}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">{companyInfo.name}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
            <InfoItem label="Legal Entity" value={companyInfo.legalEntity} />
            <InfoItem
              label="Industry / Business Sector"
              value={companyInfo.industry}
            />
            <InfoItem label="Company Email Address" value={companyInfo.email} />
            <InfoItem label="Company Phone Number" value={companyInfo.phone} />
            <InfoItem
              label="Business Registration Number"
              value={companyInfo.regNumber}
            />
            <InfoItem
              label="Website (Optional)"
              value={companyInfo.website ?? "-"}
            />
            <div className="md:col-span-3">
              <InfoItem label="Company Address" value={companyInfo.address} />
            </div>
          </div>

          <h2 className="font-semibold text-xl">Payroll Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
            <InfoItem
              label="Bank Account Name"
              value={payrollInfo.bankAccountName}
            />
            <InfoItem
              label="Bank Account Number"
              value={payrollInfo.bankAccountNumber}
            />
            <InfoItem
              label="Bank Account Holder"
              value={payrollInfo.bankAccountHolder}
            />
            <InfoItem label="Currency" value={payrollInfo.currency} />
          </div>

          <div className="flex mt-4">
            <Button
              variant="outline"
              className="flex flex-row gap-6"
              onClick={() =>
                router.push("/settings/company/company-profile/edit")
              }
            >
              <Edit3 />
              Edit Company Information
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
