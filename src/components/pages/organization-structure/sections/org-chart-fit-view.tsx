"use client";

import { useEffect } from "react";
import { useReactFlow } from "@xyflow/react";

interface OrgChartFitViewProps {
  /** Value that changes when the chart should re-center (e.g. depth, employee, node count). */
  trigger: string | number;
  enabled?: boolean;
}

export function OrgChartFitView({
  trigger,
  enabled = true,
}: OrgChartFitViewProps) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (!enabled) return;

    const frame = requestAnimationFrame(() => {
      void fitView({ padding: 0.15, duration: 250 });
    });

    return () => cancelAnimationFrame(frame);
  }, [trigger, enabled, fitView]);

  return null;
}
