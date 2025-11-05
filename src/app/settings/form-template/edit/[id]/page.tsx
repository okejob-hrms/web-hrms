"use client";

import * as React from "react";
import { SettingsFormTemplateAdd } from "@/components/pages/settings-form-template-add";
import { usePathname } from "next/navigation";

export default function FormTemplateAdd() {
  const pathname = usePathname();
  if (Number(pathname.split("/")[4])) {
    return (
      <SettingsFormTemplateAdd editFormId={Number(pathname.split("/")[4])} />
    );
  }

  return <SettingsFormTemplateAdd />;
}
