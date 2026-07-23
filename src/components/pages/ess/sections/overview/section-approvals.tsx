"use client";

import * as React from "react";
import EssApprovalsList from "@/components/pages/ess-approvals";

export const SectionApprovals = () => {
  return (
    <div className="font-sans min-h-screen flex flex-col py-6">
      <EssApprovalsList />
    </div>
  );
};
