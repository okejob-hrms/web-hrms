"use client";

import { UploadButton } from "@/components/ui/button";
import * as React from "react";

const attachmentTypes = [
  { name: "cv", label: "CV", required: true },
  {
    name: "graduation_certificate",
    label: "Graduation Certificate",
    required: true,
  },
  { name: "personal_id", label: "Personal ID Card", required: true },
  {
    name: "health_insurance_card",
    label: "Health Insurance Card (BPJS)",
    required: true,
  },
  { name: "bank_account_book", label: "Bank Account Book", required: true },
  { name: "other", label: "Others", required: false },
];

export const AttachmentsSection = React.memo(function AttachmentsSection() {
  return (
    <React.Fragment>
      <h2 className="font-semibold text-lg leading-5 mb-3">Attachments</h2>
      <div className="grid grid-cols-2 gap-4">
        {attachmentTypes.map((attachment) => (
          <UploadButton
            key={attachment.name}
            name={attachment.name}
            label={attachment.label}
            required={attachment.required}
          />
        ))}
      </div>
    </React.Fragment>
  );
});
