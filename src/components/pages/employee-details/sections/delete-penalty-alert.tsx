import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePenalty } from "@/services/employees/penalties";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface DeletePenaltyAlertProps {
  penaltyId: number | null;
  userId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeletePenaltyAlert({
  penaltyId,
  userId,
  open,
  onOpenChange,
}: DeletePenaltyAlertProps) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();

  const { mutate: handleDelete, isPending } = useMutation({
    mutationFn: () => deletePenalty(penaltyId!),
    onSuccess: () => {
      toast.success(t("penaltyDeletedSuccess"));
      queryClient.invalidateQueries({
        queryKey: ["employee-penalties", userId],
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || t("penaltyDeleteFailed"));
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{t("penaltyDeleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("penaltyDeleteDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? tCommon("deleting") : tCommon("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
