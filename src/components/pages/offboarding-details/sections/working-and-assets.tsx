"use client";

import * as React from "react";
import { WorkHandoverTable } from "./tables/work-handover-table";
import { DocumentHandoverTable } from "./tables/document-handover-table";
import { EquipmentReturnTable } from "./tables/equipment-return-table";
import { FacilitiesReturnTable } from "./tables/facilities-return-table";
import { CompleteOffboardingModal } from "./modals/complete-offboarding";
import { CancelOffboardingModal } from "./modals/cancel-offboarding";

interface Props {
  offboarding_id: number;
  readOnly?: boolean;
}

export const WorkingAndAssets = React.memo(function WorkingAndAssets({
  offboarding_id,
  readOnly = false,
}: Props) {
  return (
    <div className="w-full flex flex-col gap-4">
      <WorkHandoverTable
        offboarding_id={offboarding_id}
        readOnly={readOnly}
      />
      <DocumentHandoverTable
        offboarding_id={offboarding_id}
        readOnly={readOnly}
      />
      <EquipmentReturnTable
        offboarding_id={offboarding_id}
        readOnly={readOnly}
      />
      <FacilitiesReturnTable
        offboarding_id={offboarding_id}
        readOnly={readOnly}
      />
      {!readOnly && (
        <div className="flex gap-4">
          <CompleteOffboardingModal offboardingId={offboarding_id} />
          <CancelOffboardingModal offboardingId={offboarding_id} />
        </div>
      )}
    </div>
  );
});
