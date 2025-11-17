"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SettingsFormTemplateDetails } from "@/components/pages/settings-form-template-details";

export default function FormTemplateDetailsPage() {
  const pathname = usePathname();
  if (Number(pathname.split("/")[3])) {
    return (
      <SettingsFormTemplateDetails
        editFormId={Number(pathname.split("/")[3])}
      />
    );
  }

  return <SettingsFormTemplateDetails />;
}
