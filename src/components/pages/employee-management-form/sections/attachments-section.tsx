/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { UploadButton } from "@/components/ui/button";
import * as React from "react";
import { useFormContext } from "react-hook-form";

const attachmentTypes = [
  { name: "cv", label: "CV", required: true },
  {
    name: "graduation_certificate",
    label: "Graduation Certificate",
    required: true,
  },
  { name: "personal_id", label: "Personal ID Card", required: true },
  { name: "family_card", label: "Family Card", required: true },
  { name: "npwp", label: "NPWP", required: true },
  {
    name: "health_insurance_card",
    label: "Health Insurance Card (BPJS)",
    required: true,
  },
  { name: "bank_account_book", label: "Bank Account Book", required: true },
  { name: "driver_license", label: "Driver License", required: true },
  { name: "other", label: "Others", required: false },
];

interface AttachmentsSectionProps {
  employee_documents?: Array<{
    id: number;
    type: string;
    filename: string;
    mime_type: string;
    size: number;
    path: string;
    disk: string;
    uploaded_by: number;
    uploaded_at: string;
    created_at: string;
    updated_at: string;
  }>;
}

export const AttachmentsSection = React.memo(function AttachmentsSection({
  employee_documents,
}: AttachmentsSectionProps) {
  const form = useFormContext();
  const errors = form.formState.errors["attachments"] as any;

  return (
    <React.Fragment>
      <h2 className="font-semibold text-lg leading-5 mb-3">Attachments</h2>
      <div className="grid grid-cols-2 gap-4">
        {attachmentTypes.map((attachment, index) => {
          const document = employee_documents?.find(
            (doc) => doc.type === attachment.name,
          );
          return (
            <UploadButton
              key={attachment.name}
              name={attachment.name}
              label={attachment.label}
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
