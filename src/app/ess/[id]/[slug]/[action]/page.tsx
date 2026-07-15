"use client";

import * as React from "react";
import EssOverviewDetail from "@/components/pages/ess/sections/overview/detail";

export default function EssDetailAction({
  params,
}: {
  params: Promise<{ id: string; slug: string; action: string }>;
}) {
  const { id, slug, action } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <EssOverviewDetail section={id} id={slug} action={action} />
    </div>
  );
}
