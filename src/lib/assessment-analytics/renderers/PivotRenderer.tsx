"use client";

import { useTranslations } from "next-intl";
import type { PivotResult, SavedView } from "@hrms/assessment-analytics";
import { getRenderer, isRendererValid } from "@hrms/assessment-analytics";
import { ColumnChart } from "./ColumnChart";
import { StackedChart } from "./StackedChart";
import { TableRenderer } from "./TableRenderer";
import { EmptySupervisorState } from "./EmptySupervisorState";

type Props = {
  view: SavedView;
  result: PivotResult | null;
  loading?: boolean;
  onDrill?: (dims: Record<string, string>) => void;
};

export function PivotRenderer({ view, result, loading, onDrill }: Props) {
  const t = useTranslations("dashboard");
  const valid = isRendererValid(view);
  const spec = getRenderer(view.render.type);

  if (!valid && spec) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 px-6 text-center text-sm text-muted-foreground">
        {spec.reasonWhenInvalid(view)}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
        {t("analyticsPreviewLoading")}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
        {t("analyticsPreviewEmpty")}
      </div>
    );
  }

  if (result.meta.emptyReason === "no_supervisor_merged") {
    return <EmptySupervisorState />;
  }

  if (view.render.type === "table") {
    return <TableRenderer result={result} onDrill={onDrill} />;
  }

  if (view.render.type === "column_stacked" || view.render.type === "column_grouped") {
    return (
      <StackedChart
        result={result}
        grouped={view.render.type === "column_grouped"}
        onDrill={onDrill}
      />
    );
  }

  return <ColumnChart result={result} onDrill={onDrill} />;
}
