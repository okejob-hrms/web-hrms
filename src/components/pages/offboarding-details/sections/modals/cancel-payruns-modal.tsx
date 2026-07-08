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
import { useTranslations } from "next-intl";

interface Props {
  offboardingId: number;
}

export const CancelPayrunsModal = React.memo(function CancelPayrunsModal({
  offboardingId,
}: Props) {
  const t = useTranslations("offboarding");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const cancelMutation = useMutation({
    mutationFn: () => postCancelledOffboarding(offboardingId),
    onSuccess: () => {
      toast.success(t("cancelOffboardingSuccess"));
      router.push("/employee/off-boarding");
    },
    onError: (error: any) => {
      if (error?.response) {
        try {
          error.response
            .json()
            .then((errorData: ApiErrorResponse) => {
              toast.error(
                errorData.message || t("cancelOffboardingFailed"),
              );
            })
            .catch(() => {
              toast.error(
                `${t("cancelOffboardingFailed")}: ${t("serverError")}`,
              );
            });
        } catch (parseError) {
          toast.error(
            `${t("cancelOffboardingFailed")}: ${t("serverError")} : ${parseError}`,
          );
        }
      } else {
        toast.error(
          `${t("cancelOffboardingFailed")}: ${error.message || t("unknownError")}`,
        );
      }
    },
  });
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="font-semibold text-error text-sm hover:text-error"
        >
          <Image src="/icons/close.svg" width={24} height={24} alt={tCommon("cancel")} />{" "}
          {tCommon("cancel")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader className="items-center">
          <Image
            src="/icons/confirmation.svg"
            width={56}
            height={56}
            alt={t("cancelAssignment")}
          />
          <AlertDialogTitle className="text-center">
            {t("cancelPayrunsConfirmTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-text-secondary">
            {t("cancelPayrunsConfirmDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="w-full grid grid-cols-2">
          <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-error text-white"
            onClick={() => cancelMutation.mutate()}
          >
            {t("cancelAssignment")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
