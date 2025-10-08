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
import { postCompleteOffboarding } from "@/services/employees/offboardings/complete-offboarding";
import { ApiErrorResponse } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  offboardingId: number;
}

export const CompleteOffboardingModal = React.memo(
  function CompleteOffboardingModal({ offboardingId }: Props) {
    const router = useRouter();
    const completeMutation = useMutation({
      mutationFn: () => postCompleteOffboarding(offboardingId),
      onSuccess: () => {
        toast.success("Success complete offboarding process");
        router.push("/employee/off-boarding");
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
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Complete Offboarding Process</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader className="items-center">
            <Image
              src="/icons/confirmation.svg"
              width={56}
              height={56}
              alt="complete offboarding"
            />
            <AlertDialogTitle className="text-center">
              Are you sure you want to complete this offboarding process?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-text-secondary">
              Once confirmed, the employee’s access will be revoked and cannot
              be restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full grid grid-cols-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-error text-white"
              onClick={() => completeMutation.mutate()}
            >
              Complete Offboarding
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
