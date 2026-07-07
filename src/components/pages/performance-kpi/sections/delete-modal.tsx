import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import * as React from 'react';

interface IDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: number) => void;
  id: number;
}

export const DeleteModal: React.FC<IDeleteModalProps> = ({
  open,
  onOpenChange,
  onSave,
  id,
}) => {
  const t = useTranslations('performance');
  const tCommon = useTranslations('common');

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onOpenChange(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto p-2 bg-white">
        <DialogHeader className="px-6 pt-6 pb-4">
          <Image
            src="/icons/confirmation.svg"
            height={56}
            width={56}
            alt="confirmation"
            className="m-auto"
          />
          <DialogTitle className="text-xl font-semibold text-center">
            {t('confirmDeleteKpi')}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-center">
          {t('confirmDeleteKpiDesc')}
        </DialogDescription>
        <DialogFooter className="px-6 pb-6 w-full grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button
            variant="ghost"
            className="font-semibold text-error"
            onClick={() => onSave(id)}
          >
            {t('deleteKpi')}
          </Button>
          <Button className="font-semibold" onClick={() => onOpenChange(false)}>
            {tCommon('cancel')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
