"use client";

import * as React from "react";
import { WorkHandoverTable } from "./tables/work-handover-table";
import { DocumentHandoverTable } from "./tables/document-handover-table";
import { EquipmentReturnTable } from "./tables/equipment-return-table";
import { FacilitiesReturnTable } from "./tables/facilities-return-table";
import { usePathname } from "next/navigation";
import { CompleteOffboardingModal } from "./modals/complete-offboarding";
import { CancelOffboardingModal } from "./modals/cancel-offboarding";

export const WorkingAndAssets = React.memo(function WorkingAndAssets() {
  const pathname = usePathname();
  const offboardingId = Number(pathname.split("/")[3]);

  return (
    <div className="w-full flex flex-col gap-4">
      <WorkHandoverTable offboarding_id={offboardingId} />
      <DocumentHandoverTable offboarding_id={offboardingId} />
      <EquipmentReturnTable offboarding_id={offboardingId} />
      <FacilitiesReturnTable offboarding_id={offboardingId} />
      <div className="flex gap-4">
        <CompleteOffboardingModal offboardingId={offboardingId} />
        <CancelOffboardingModal offboardingId={offboardingId} />
      </div>
    </div>
  );
});
