'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Dispatch, SetStateAction, useState } from 'react';
import { PayrunLogList } from '@/services/payroll/types';
import { Loader2 } from 'lucide-react';
import { PaginationState } from '@tanstack/react-table';
import { useLocale, useTranslations } from 'next-intl';
import { formatDateTime } from '@/lib/formatting';
import { resolveLocale } from '@/lib/i18n/locale';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: PayrunLogList[];
  page: {
    pageIndex: number;
    pageSize: number;
  };
  setPage: Dispatch<SetStateAction<PaginationState>>;
  loading: boolean;
}

export function PayrunsHistorySheet({
  open,
  onOpenChange,
  history,
  page,
  setPage,
  loading,
}: Props) {
  const [expand, setExpand] = useState(false);
  const t = useTranslations('payroll');
  const locale = resolveLocale(useLocale());

  const visibleHistory = expand ? history : history.slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-gray-50"
      >
        <SheetHeader className="border-b p-5 bg-white">
          <SheetTitle>{t('payrunHistory')}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-5">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="space-y-6">
              {visibleHistory.map((item, i) => {
                const stamp = formatDateTime(item.created_at, locale);
                return (
                  <div key={i} className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {stamp.date} {stamp.hour}
                    </p>
                    <p className="text-sm font-medium">{item.actor?.name}</p>
                    <p className="text-sm">{item.message}</p>
                  </div>
                );
              })}

              {history.length > 2 && (
                <div className="flex items-center justify-center w-full">
                  <Button variant="ghost" onClick={() => setExpand(!expand)}>
                    {expand ? t('showLess') : t('showMore')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
