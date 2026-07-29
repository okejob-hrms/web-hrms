"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

/** Legacy page — salary adjustment now opens as a modal on the offboarding detail. */
export default function OffboardingSalaryAdjustmentPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);

  React.useEffect(() => {
    router.replace(`/employee/off-boarding/${id}`);
  }, [id, router]);

  return null;
}
