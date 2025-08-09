"use client";

import { UploadButton } from "@/components/ui/button";
import * as React from "react";

export const AttachmentsSection = React.memo(function AttachmentsSection() {
  return (
    <React.Fragment>
      <h2 className="font-semibold text-lg leading-5 mb-3">Attachments</h2>
      <div className="grid grid-cols-2 gap-4">
        <UploadButton label="CV" required />
        <UploadButton label="Graduation Certificate" required />
        <UploadButton label="Personal ID Card" required />
        <UploadButton label="Health Insurance Card (BPJS)" required />
        <UploadButton label="Bank Account Book" required />
        <UploadButton label="Others" />
      </div>
    </React.Fragment>
  );
});
