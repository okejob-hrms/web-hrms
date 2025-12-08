"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

interface LinearProgressProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  labelPosition?: "right" | "left" | "top" | "bottom";
  progressWidth?: string;
  animateOnMount?: boolean;
  animationDelay?: number;
  animationDuration?: number;
}

function LinearProgress({
  value,
  className,
  showLabel = true,
  labelPosition = "right",
  progressWidth = "w-full",
  animateOnMount = true,
  animationDelay = 100,
  animationDuration = 500,
}: LinearProgressProps) {
  const [displayValue, setDisplayValue] = React.useState(
    animateOnMount ? 0 : value,
  );

  React.useEffect(() => {
    if (!animateOnMount) {
      setDisplayValue(value);
      return;
    }

    const startTimer = setTimeout(() => {
      setDisplayValue(value);
    }, animationDelay);

    return () => clearTimeout(startTimer);
  }, [value, animateOnMount, animationDelay]);

  const labelElement = showLabel && (
    <span className="text-sm font-medium">{Math.round(displayValue)}%</span>
  );

  const progressElement = (
    <Progress
      value={displayValue}
      className={cn(progressWidth, "transition-all")}
      style={{ transitionDuration: `${animationDuration}ms` }}
    />
  );

  const layoutClasses = {
    right: "flex-row gap-3",
    left: "flex-row-reverse gap-3",
    top: "flex-col gap-2",
    bottom: "flex-col-reverse gap-2",
  };

  return (
    <div
      className={cn(
        "w-full flex items-center",
        layoutClasses[labelPosition],
        className,
      )}
    >
      {labelPosition === "top" || labelPosition === "bottom" ? (
        <>
          {labelElement}
          {progressElement}
        </>
      ) : (
        <>
          {progressElement}
          {labelElement}
        </>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  renderLabel?: (progress: number) => number | string;
  size?: number;
  strokeWidth?: number;
  circleStrokeWidth?: number;
  progressStrokeWidth?: number;
  shape?: "square" | "round";
  className?: string;
  progressClassName?: string;
  labelClassName?: string;
  showLabel?: boolean;
}

const CircularProgress = ({
  value,
  renderLabel,
  className,
  progressClassName,
  labelClassName,
  showLabel,
  shape = "round",
  size = 100,
  strokeWidth,
  circleStrokeWidth = 10,
  progressStrokeWidth = 10,
}: CircularProgressProps) => {
  const radius = size / 2 - 10;
  const circumference = Math.ceil(3.14 * radius * 2);
  const percentage = Math.ceil(circumference * ((100 - value) / 100));

  const viewBox = `-${size * 0.125} -${size * 0.125} ${size * 1.25} ${
    size * 1.25
  }`;

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: "rotate(-90deg)" }}
        className="relative"
      >
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          strokeWidth={strokeWidth ?? circleStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset="0"
          className={cn("stroke-primary/25", className)}
        />
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeWidth={strokeWidth ?? progressStrokeWidth}
          strokeLinecap={shape}
          strokeDashoffset={percentage}
          fill="transparent"
          strokeDasharray={circumference}
          className={cn("stroke-primary", progressClassName)}
        />
      </svg>
      {showLabel && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center text-md",
            labelClassName,
          )}
        >
          {renderLabel ? renderLabel(value) : value}
        </div>
      )}
    </div>
  );
};

export { Progress, LinearProgress, CircularProgress };
