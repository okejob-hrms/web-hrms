"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useCompanyProfile } from "./hook";
import { Can } from "@/components/auth/can";

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
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const { data, isLoading, isError } = useCompanyProfile();

  if (isLoading) return <p>{tCommon("loading")}</p>;
  if (isError || !data) return <p>{t("failedLoadCompanyProfile")}</p>;

  const { companyInfo, payrollInfo } = data;

  return (
    <div className="font-sans min-h-screen bg-gray-50">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-gray-200 flex flex-col gap-4 p-6">
          <h2 className="font-semibold text-xl">{t("companyInformation")}</h2>
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={companyInfo.logo_url || ""}
                alt={t("companyLogo")}
              />
              <AvatarFallback className="bg-blue-50 text-blue-700">
                {companyInfo.name?.charAt(0) ?? "C"}
              </AvatarFallback>
            </Avatar>
            <p className="font-semibold text-lg">{companyInfo.name}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
            <InfoItem label={t("legalEntity")} value={companyInfo.legalEntity} />
            <InfoItem
              label={t("industryBusinessSector")}
              value={companyInfo.industry}
            />
            <InfoItem label={t("companyEmail")} value={companyInfo.email} />
            <InfoItem label={t("companyPhone")} value={companyInfo.phone} />
            <InfoItem
              label={t("businessRegNumber")}
              value={companyInfo.regNumber}
            />
            <InfoItem
              label={t("websiteOptional")}
              value={companyInfo.website ?? "-"}
            />
            <div className="md:col-span-3">
              <InfoItem label={t("companyAddress")} value={companyInfo.address} />
            </div>
          </div>

          <h2 className="font-semibold text-xl">{t("payrollInformation")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 mb-3">
            <InfoItem
              label={t("bankAccountName")}
              value={payrollInfo.bankAccountName}
            />
            <InfoItem
              label={t("bankAccountNumber")}
              value={payrollInfo.bankAccountNumber}
            />
            <InfoItem
              label={t("bankAccountHolder")}
              value={payrollInfo.bankAccountHolder}
            />
            <InfoItem label={t("currency")} value={payrollInfo.currency} />
          </div>

          <div className="flex mt-4">
            <Can permission="general_settings.company_profile.edit">
              <Button
                variant="outline"
                className="flex flex-row gap-6"
                onClick={() =>
                  router.push("/settings/company/company-profile/edit")
                }
              >
                <Edit3 />
                {t("editCompanyInformation")}
              </Button>
            </Can>
          </div>
        </div>
      </div>
    </div>
  );
}
