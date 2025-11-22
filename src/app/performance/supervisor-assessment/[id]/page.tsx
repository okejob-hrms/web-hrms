"use client";
import { SupervisorAssessmentDetails } from "@/components/pages/performance-supervisor-assessment-details";
import * as React from "react";

export default function SupervisorAssessmentDetailsPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = React.use(params);
  const numericId = Number(id);

  if (!numericId) {
    return <div>Data not found</div>;
  }

  return <SupervisorAssessmentDetails id={numericId} />;
}
