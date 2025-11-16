'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: {
    time: string;
    author: string;
    details: string[];
  }[];
}

export function PayrunsHistorySheet({ open, onOpenChange, history }: Props) {
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
          <div className="space-y-6">
            {visibleHistory.map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="text-xs text-muted-foreground">{item.time}</p>
                <p className="text-sm font-medium">{item.author}</p>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  {item.details.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
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
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
