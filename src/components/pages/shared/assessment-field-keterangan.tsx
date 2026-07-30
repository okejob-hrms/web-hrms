import * as React from "react";
import { cn } from "@/lib/utils";

interface AssessmentFieldKeteranganProps {
  description?: string | null;
  levelName?: string | null;
  className?: string;
}

/**
 * Shows competency level name (tag helper) + keterangan under assessment items.
 */
export function AssessmentFieldKeterangan({
  description,
  levelName,
  className,
}: AssessmentFieldKeteranganProps) {
  const trimmedDescription = description?.trim() || "";
  const trimmedLevelName = levelName?.trim() || "";

  if (!trimmedDescription && !trimmedLevelName) {
    return null;
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {trimmedLevelName ? (
        <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary-background px-2 py-0.5 text-xs font-medium text-primary">
          {trimmedLevelName}
        </span>
      ) : null}
      {trimmedDescription ? (
        <p className="text-sm text-text-secondary whitespace-pre-line">
          {trimmedDescription}
        </p>
      ) : null}
    </div>
  );
}
