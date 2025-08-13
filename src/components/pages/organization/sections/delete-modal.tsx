import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  iconSrc?: string;
  iconSize?: number;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  cancelColor?: string;
}

export default function DeleteDialog({
  open,
  onOpenChange,
  onDelete,
  iconSrc = "/icons/delete.svg",
  iconSize = 50,
  title = "Are you sure you want to delete this?",
  description = "Deleting this item may affect related data. Please confirm your action.",
  confirmText = "Delete",
  cancelText = "Cancel",
  confirmColor = "text-red-500",
  cancelColor = "bg-[#18618B] hover:bg-[#14506e] text-white",
}: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-full max-w-md sm:max-w-md text-center bg-white">
        <div className="flex flex-col items-center justify-center mb-4">
          {iconSrc && (
            <span className="mb-2">
              <Image
                src={iconSrc}
                width={iconSize}
                height={iconSize}
                alt="icon"
              />
            </span>
          )}
          <AlertDialogTitle className="text-xl font-bold mb-2">
            {title}
          </AlertDialogTitle>
          {description && (
            <div className="text-gray-600 text-sm mb-4">{description}</div>
          )}
        </div>
        <AlertDialogFooter className="flex flex-row gap-4 w-full justify-center">
          <Button
            className={`w-1/2 bg-transparent hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none ${confirmColor}`}
            onClick={onDelete}
          >
            {confirmText}
          </Button>
          <Button
            className={`w-1/2 font-medium py-2 rounded-lg ${cancelColor}`}
            onClick={() => onOpenChange(false)}
          >
            {cancelText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
