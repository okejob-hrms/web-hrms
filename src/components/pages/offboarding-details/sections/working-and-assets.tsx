import * as React from "react";
import { WorkHandoverTable } from "./tables/work-handover-table";
import { DocumentHandoverTable } from "./tables/document-handover-table";
import { EquipmentReturnTable } from "./tables/equipment-return-table";
import { FacilitiesReturnTable } from "./tables/facilities-return-table";
import { Button } from "@/components/ui/button";

interface Props {
  offboarding_id: number;
}

export const WorkingAndAssets = React.memo(function WorkingAndAssets() {
  return (
    <div className="w-full flex flex-col gap-4">
      <WorkHandoverTable offboarding_id={1} />
      <DocumentHandoverTable offboarding_id={1} />
      <EquipmentReturnTable offboarding_id={1} />
      <FacilitiesReturnTable offboarding_id={1} />
      <div className="flex gap-4">
        <Button type="submit" variant="outline">
          Complete Offboarding Process
        </Button>
        <Button
          variant="ghost"
          className="text-error hover:bg-error-background hover:text-error"
        >
          Cancel Offboarding Process
        </Button>
      </div>
    </div>
  );
});
