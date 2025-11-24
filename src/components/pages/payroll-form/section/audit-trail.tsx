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

  const visibleHistory = expand ? history : history.slice(0, 2);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col bg-gray-50"
      >
        <SheetHeader className="border-b p-5 bg-white">
          <SheetTitle>Payruns History</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-5">
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <div className="space-y-6">
              {visibleHistory.map((item, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {item.created_at}
                  </p>
                  <p className="text-sm font-medium">{item.actor?.name}</p>
                  <p className="text-sm">
                    {item.event} - {item.message}
                  </p>
                  {/* <ul className="list-disc pl-4 space-y-1 text-sm">
                  {item.details.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul> */}
                </div>
              ))}

              {history.length > 2 && (
                <div className="flex items-center justify-center w-full">
                  <Button variant="ghost" onClick={() => setExpand(!expand)}>
                    {expand ? 'Show Less' : 'Show More'}
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
