"use client";
import * as React from "react";

export default function OffboardingDetailLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return <main className="w-full md:px-[125px] px-4">{children}</main>;
}
