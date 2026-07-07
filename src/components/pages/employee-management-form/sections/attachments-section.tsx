/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UploadButton } from "@/components/ui/button";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

const attachmentTypeKeys = [
  { name: "cv", labelKey: "attachmentCv", required: true },
  {
    name: "graduation_certificate",
    labelKey: "attachmentGraduationCertificate",
    required: true,
  },
  { name: "personal_id", labelKey: "attachmentPersonalId", required: true },
  { name: "family_card", labelKey: "attachmentFamilyCard", required: true },
  { name: "npwp", labelKey: "attachmentNpwp", required: false },
  {
    name: "health_insurance_card",
    labelKey: "attachmentHealthInsurance",
    required: false,
  },
  { name: "bank_account_book", labelKey: "attachmentBankBook", required: true },
  { name: "driver_license", labelKey: "attachmentDriverLicense", required: false },
  { name: "other", labelKey: "attachmentOthers", required: false },
] as const;

interface AttachmentsSectionProps {
  employee_documents?: Array<{
    id: number;
    type: string;
    filename: string;
    mime_type: string;
    size: number;
    path: string;
    disk: string;
    uploaded_by: {
      id: number;
      name: string;
    };
    uploaded_at: string;
    created_at: string;
    updated_at: string;
  }>;
}

export const AttachmentsSection = React.memo(function AttachmentsSection({
  employee_documents,
}: AttachmentsSectionProps) {
  const t = useTranslations("employee");
  const form = useFormContext();
  const errors = form.formState.errors["attachments"] as any;

  return (
    <React.Fragment>
      <h2 className="font-semibold text-lg leading-5 mb-3">{t("attachments")}</h2>
      <div className="grid grid-cols-2 gap-4">
        {attachmentTypeKeys.map((attachment, index) => {
          const document = employee_documents?.find(
            (doc) => doc.type === attachment.name,
          );
          return (
            <UploadButton
              key={attachment.name}
              name={attachment.name}
              label={t(attachment.labelKey)}
              required={attachment.required}
              defaultFile={document || undefined}
              error={errors && errors[index]?.path.message}
            />
          );
        })}
      </div>
    </React.Fragment>
  );
});
