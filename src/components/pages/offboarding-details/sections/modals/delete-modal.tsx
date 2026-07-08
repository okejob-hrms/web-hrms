import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function DeleteDialog({
  open,
  onOpenChange,
  onDelete,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isLoading?: boolean;
}) {
  const t = useTranslations("offboarding");
  const tCommon = useTranslations("common");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md sm:max-w-md text-center bg-white">
        <div className="flex flex-col items-center justify-center mb-4">
          <span className="mb-2">
            <Image
              src={"/icons/delete.svg"}
              width={50}
              height={50}
              alt={tCommon("delete")}
            />
          </span>
          <DialogTitle className="text-xl font-bold mb-2">
            {t("deleteItemConfirm")}
          </DialogTitle>
        </div>
        <DialogFooter className="flex flex-row gap-4 w-full justify-center">
          <Button
            className="w-1/2 bg-transparent text-red-500 hover:bg-transparent font-medium py-2 rounded-lg shadow-none border-none"
            onClick={onDelete}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? tCommon("deleting") : t("deleteItem")}
          </Button>
          <Button
            className="w-1/2 bg-[#18618B] hover:bg-[#14506e] text-white font-medium py-2 rounded-lg"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            type="button"
          >
            {tCommon("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
