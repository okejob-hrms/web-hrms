"use client";

import SelfAssessmentList from "@/components/pages/performance-self-assessment";
import * as React from "react";

export const SectionAssessment = () => {
  return (
    <div className="font-sans min-h-screen flex flex-col py-6">
      <SelfAssessmentList />;
    </div>
  );
};
