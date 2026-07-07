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
import { useTranslations } from "next-intl";

interface Props {
  offboardingId: number;
}

export const CompleteOffboardingModal = React.memo(
  function CompleteOffboardingModal({ offboardingId }: Props) {
    const t = useTranslations("offboarding");
    const tCommon = useTranslations("common");
    const router = useRouter();
    const completeMutation = useMutation({
      mutationFn: () => postCompleteOffboarding(offboardingId),
      onSuccess: () => {
        toast.success(t("completeOffboardingSuccess"));
        router.push("/employee/off-boarding");
      },
      onError: (error: any) => {
        if (error?.response) {
          try {
            error.response
              .json()
              .then((errorData: ApiErrorResponse) => {
                toast.error(
                  errorData.message || t("completeOffboardingFailed"),
                );
              })
              .catch(() => {
                toast.error(
                  `${t("completeOffboardingFailed")}: ${t("serverError")}`,
                );
              });
          } catch (parseError) {
            toast.error(
              `${t("completeOffboardingFailed")}: ${t("serverError")} : ${parseError}`,
            );
          }
        } else {
          toast.error(
            `${t("completeOffboardingFailed")}: ${error.message || t("unknownError")}`,
          );
        }
      },
    });
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">{t("completeOffboardingProcess")}</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader className="items-center">
            <Image
              src="/icons/confirmation.svg"
              width={56}
              height={56}
              alt={t("completeOffboarding")}
            />
            <AlertDialogTitle className="text-center">
              {t("completeOffboardingConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-text-secondary">
              {t("completeOffboardingConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="w-full grid grid-cols-2">
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-error text-white"
              onClick={() => completeMutation.mutate()}
            >
              {t("completeOffboarding")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  },
);
