"use client";

import * as React from "react";
import SettingsAccessControlAdd from "@/components/pages/settings-access-control-form";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <SettingsAccessControlAdd id={id} />
    </div>
  );
}
