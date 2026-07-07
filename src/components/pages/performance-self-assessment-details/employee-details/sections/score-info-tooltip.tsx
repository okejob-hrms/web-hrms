import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CircleHelp } from "lucide-react";
import * as React from "react";

interface ScoreInfoTooltipProps {
  content: string;
  label: string;
}

export function ScoreInfoTooltip({ content, label }: ScoreInfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 text-text-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full"
          aria-label={label}
        >
          <CircleHelp className="size-4" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-xs whitespace-pre-line text-left leading-relaxed"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

interface ScoreWithInfoProps {
  value: string;
  tooltip: string;
  tooltipLabel: string;
  className?: string;
}

export function ScoreWithInfo({
  value,
  tooltip,
  tooltipLabel,
  className,
}: ScoreWithInfoProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <span>{value}</span>
      <ScoreInfoTooltip content={tooltip} label={tooltipLabel} />
    </div>
  );
}
