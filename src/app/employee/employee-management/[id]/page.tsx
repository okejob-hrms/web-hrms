"use client";
import * as React from "react";
import { EmployeeDetail } from "@/components/pages/employee-details";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <EmployeeDetail id={id} />
    </div>
  );
}
