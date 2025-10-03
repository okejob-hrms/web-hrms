'use client';

import { Badge } from '@/components/ui/badge';
import * as React from 'react';

type InfoListProps = {
  title: string;
  increase?: number;
  compare?: string;
  time?: string;
  value?: number;
};

export default function InfoList({
  title,
  increase,
  compare,
  time,
  value,
}: InfoListProps) {
  return (
    <div className="font-sans">
      <div className="flex flex-col justify-between gap-6">
        <div className="rounded-md bg-white border shadow-sm border-grayscale-20 flex flex-col gap-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between w-full items-start sm:items-center gap-4 sm:gap-0">
            <div className="flex w-full justify-between">
              <h2 className="font-semibold">{title}</h2>
              {increase && (
                <div className="flex flex-row gap-2">
                  <Badge
                    className={`${String(increase).includes('-') ? 'bg-warning-background text-orange-500' : 'bg-success-background text-success'} rounded-xl`}
                  >
                    {increase}
                  </Badge>
                  <div className="flex flex-row gap-1">
                    <div className="text-gray-700">{compare}</div>
                    <div className="text-gray-700">{time}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-end justify-end">
            <h2 className="font-semibold text-2xl text-primary">{value}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
