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
  const queryClient = useQueryClient();

  const { mutate: handleDelete, isPending } = useMutation({
    mutationFn: () => deletePenalty(penaltyId!),
    onSuccess: () => {
      toast.success("Penalty deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["employee-penalties", userId],
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete penalty");
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            penalty from the employee's record.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
