/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { WorkHandoverTable } from "./tables/work-handover-table";
import { DocumentHandoverTable } from "./tables/document-handover-table";
import { EquipmentReturnTable } from "./tables/equipment-return-table";
import { FacilitiesReturnTable } from "./tables/facilities-return-table";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  postCancelledOffboarding,
  postCompleteOffboarding,
} from "@/services/employees/offboardings/complete-offboarding";
import { toast } from "sonner";
import { ApiErrorResponse } from "@/lib/types";
import { CompleteOffboardingModal } from "./modals/complete-offboarding";
import { CancelOffboardingModal } from "./modals/cancel-offboarding";

export const WorkingAndAssets = React.memo(function WorkingAndAssets() {
  const pathname = usePathname();
  const offboardingId = Number(pathname.split("/")[3]);

  const completeMutation = useMutation({
    mutationFn: () => postCompleteOffboarding(offboardingId),
    onSuccess: () => {
      toast.success("Success complete offboarding process");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message || "Failed to complete offboarding process",
              );
            })
            .catch(() => {
              toast.error(
                "Failed to complete offboarding process: Server error",
              );
            });
        } catch (parseError) {
          toast.error(
            "Failed to complete offboarding process: Server error : " +
              parseError,
          );
        }
      } else {
        toast.error(
          `Failed to complete offboarding process: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

  const cancelledMutation = useMutation({
    mutationFn: () => postCancelledOffboarding(offboardingId),
    onSuccess: () => {
      toast.success("Success cancelled offboarding process");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message || "Failed to cancel offboarding process",
              );
            })
            .catch(() => {
              toast.error("Failed to cancel offboarding process: Server error");
            });
        } catch (parseError) {
          toast.error(
            "Failed to cancel offboarding process: Server error : " +
              parseError,
          );
        }
      } else {
        toast.error(
          `Failed to cancel offboarding process: ${error.message || "Unknown error"}`,
        );
      }
    },
  });

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
