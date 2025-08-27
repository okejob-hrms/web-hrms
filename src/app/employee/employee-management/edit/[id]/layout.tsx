import type { Metadata } from "next";
import * as React from "react";

export const metadata: Metadata = {
  title: "KUBIK HRMS",
  description: "Human Resource Management System",
};

export default function EmployeeDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="w-full">{children}</main>;
}
