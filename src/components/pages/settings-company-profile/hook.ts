"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyProfile } from "@/services/settings";
import { CompanyResponse, WorkScheduleReq } from "@/services/settings/types";

// =======================
// Types lokal untuk UI
// =======================
export interface CompanyInfo {
  name: string;
  legalEntity: string;
  industry: string;
  email: string;
  phone: string;
  regNumber: string;
  website?: string;
  address: string;
  logo: string | null;
  logo_url: string | null;
}

export interface PayrollInfo {
  bankAccountName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  currency: string;
}

// export interface WorkingHour {
//   day: string;
//   shift: string;
//   workingHours: string;
//   break: string;
// }

// hasil transformasi final untuk UI
export interface CompanyProfileData {
  companyInfo: CompanyInfo;
  payrollInfo: PayrollInfo;
  // workingHours: WorkingHour[];
  // rawWorkSchedules: WorkScheduleReq[];
}

// =======================
// Hook
// =======================
export function useCompanyProfile() {
  return useQuery<CompanyResponse, Error, CompanyProfileData>({
    queryKey: ["companyProfile"],
    queryFn: getCompanyProfile,
    select: (res) => {
      const c = res.data;

      // Map CompanyInfo
      const companyInfo: CompanyInfo = {
        name: c.name,
        legalEntity: c.legal_entity_name,
        industry: c.industry,
        email: c.email,
        phone: c.phone,
        regNumber: c.business_registration_number,
        website: c.website,
        address: c.address,
        logo: c.logo,
        logo_url: c.logo_url,
      };

      // Map PayrollInfo
      const payrollInfo: PayrollInfo = {
        bankAccountName: c.payroll_bank_account_name,
        bankAccountNumber: c.payroll_bank_account_number,
        bankAccountHolder: c.payroll_bank_name,
        currency: c.payroll_currency,
      };

      // // Map WorkingHours
      // const workingHours = c.work_schedules.flatMap((day) =>
      //   day.schedules.length > 0
      //     ? day.schedules.map((s) => ({
      //         day: day.day_name,
      //         shift: s.shift_name,
      //         workingHours: `${s.start_time} - ${s.end_time}`,
      //         break:
      //           s.break_start_time && s.break_end_time
      //             ? `${s.break_start_time} - ${s.break_end_time}`
      //             : "-",
      //       }))
      //     : [
      //         {
      //           day: day.day_name,
      //           shift: "Off",
      //           workingHours: "-",
      //           break: "-",
      //         },
      //       ]
      // );

      // const rawWorkSchedules = c.work_schedules;

      return { companyInfo, payrollInfo };
    },
  });
}
