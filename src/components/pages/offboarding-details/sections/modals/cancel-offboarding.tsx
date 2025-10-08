/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { postCancelledOffboarding } from "@/services/employees/offboardings/complete-offboarding";
import { ApiErrorResponse } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  offboardingId: number;
}

export const CancelOffboardingModal = React.memo(
  function CancelOffboardingModal({ offboardingId }: Props) {
    const router = useRouter();
    const cancelMutation = useMutation({
      mutationFn: () => postCancelledOffboarding(offboardingId),
      onSuccess: () => {
        toast.success("Success cancel offboarding process");
        router.push("/employee/off-boarding");
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
                toast.error(
                  "Failed to cancel offboarding process: Server error",
                );
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="text-error hover:bg-error-background hover:text-error"
          >
            Cancel Offboarding Process
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader className="items-center">
            <Image
              src="/icons/alert.svg"
              width={56}
              height={56}
              alt="cancel offboarding"
            />
            <AlertDialogTitle className="text-center">
              Are you sure you want to cancel this offboarding process?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-text-secondary">
              All progress and records related to this offboarding will be
              permanently removed
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full grid grid-cols-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-error text-white"
              onClick={() => cancelMutation.mutate()}
            >
              Cancel Offboarding
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
