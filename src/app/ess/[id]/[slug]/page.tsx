"use client";

import * as React from "react";
import EssOverviewDetail from "@/components/pages/ess/sections/overview/detail";

export default function EssDetail({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <EssOverviewDetail section={id} id={slug} />
    </div>
  );
}
