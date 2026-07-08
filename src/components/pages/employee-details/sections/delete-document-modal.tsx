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
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  onArchieve: () => void;
  disabled: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteDocumentModal({
  onArchieve,
  disabled,
  isOpen,
  onClose,
}: Props) {
  const t = useTranslations("employee");
  const tCommon = useTranslations("common");

  const handleArchieve = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await onArchieve();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 gap-8">
        <AlertDialogHeader className="text-center items-center justify-center gap-0">
          <Image
            src="/icons/deleteContained.svg"
            height={56}
            width={56}
            alt="archieve confirmation"
            className="mb-4"
          />
          <AlertDialogTitle className="text-lg font-semibold text-black mb-2">
            {t("documentDeleteTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-text-secondary text-center">
            {t("documentDeleteDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex justify-between gap-3 w-full">
          <AlertDialogAction
            onClick={handleArchieve}
            className="flex-1 bg-transparent hover:opacity-50 hover:bg-transparent font-semibold text-error rounded-md py-2"
            disabled={disabled}
          >
            {disabled ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                {tCommon("deleting")}
              </>
            ) : (
              t("deleteDocument")
            )}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onClose}
            className="flex-1 border bg-primary text-white border-primary hover:text-white rounded-md py-2 font-semibold"
          >
            {tCommon("cancel")}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
