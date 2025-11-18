import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatusCardProps {
  label?: string;
  current: number;
  total: number;
  statusColor?: string;
}

export default function StatusCard({
  label = "Completed",
  current,
  total,
  statusColor = "#0ea5e9",
}: StatusCardProps) {
  return (
    <Card className="w-full max-w-3xl rounded-sm border border-grayscale-10 shadow-none">
      <CardContent>
        <div className="flex flex-col justify-between gap-4">
          <div className="flex items-center gap-1">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-xs font-semibold text-grayscale-70">
              {label}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xl font-bold text-primary">{current}</span>
            <span className="text-base font-normal text-text-disabled">
              /{total}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
