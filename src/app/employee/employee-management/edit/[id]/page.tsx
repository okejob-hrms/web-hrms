"use client";
import { EditEmployeeForm } from "@/components/pages/employee-management-form/edit";
import * as React from "react";

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = React.use(params);
  return (
    <div className="font-sans min-h-screen">
      <EditEmployeeForm employee_profile_id={id} />
    </div>
  );
}
