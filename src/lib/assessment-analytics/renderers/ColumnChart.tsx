"use client";

import type { PivotResult } from "@hrms/assessment-analytics";
import { gradeColor } from "./colors";

type Props = {
  result: PivotResult;
  onDrill?: (dims: Record<string, string>) => void;
};

export function ColumnChart({ result, onDrill }: Props) {
  const rowDim = result.dimensions.find((d) => d.role === "row");
  const measureKey = result.measures[0]?.key ?? "m0";
  const members = rowDim?.members ?? [];
  const byKey = new Map(
    result.rows.map((r) => [r.dims[rowDim?.key ?? ""] ?? "", r]),
  );
  const values = members.map((m) => {
    const row = byKey.get(m.key);
    if (!row) {
      return {
        key: m.key,
        label: m.label,
        value: null,
        n: 0,
        suppressed: false,
        missing: true,
      };
    }
    return {
      key: m.key,
      label: m.label,
      value: row.suppressed ? null : Number(row.values[measureKey] ?? 0),
      n: row.n ?? 0,
      suppressed: row.suppressed ?? false,
      missing: false,
    };
  });
  const max = Math.max(
    1,
    ...values.map((v) => (typeof v.value === "number" ? v.value : 0)),
  );
  const suffix =
    (result.measures[0]?.format as { suffix?: string })?.suffix ?? "";

  return (
    <div className="flex min-h-[320px] flex-col gap-3">
      <div className="flex flex-1 items-end gap-2 px-2 pt-6">
        {values.map((v, i) => {
          const h = v.value == null ? 8 : Math.max(4, (v.value / max) * 240);
          return (
            <button
              key={v.key}
              type="button"
              disabled={v.suppressed || v.missing}
              onClick={() =>
                rowDim &&
                !v.suppressed &&
                !v.missing &&
                onDrill?.({ [rowDim.key]: v.key })
              }
              className="group flex flex-1 flex-col items-center gap-2 disabled:cursor-not-allowed"
              title={
                v.suppressed
                  ? "Disembunyikan (n kecil)"
                  : v.missing
                    ? undefined
                    : undefined
              }
            >
              <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                {v.suppressed || v.missing ? "—" : `${v.value}${suffix}`}
              </span>
              <div
                className="w-full max-w-[56px] rounded-t-md transition-opacity group-hover:opacity-90"
                style={{
                  height: h,
                  background:
                    v.suppressed || v.missing
                      ? "repeating-linear-gradient(135deg,#ddd 0 4px,#eee 4px 8px)"
                      : gradeColor(v.label, i),
                }}
              />
              <div className="text-center text-[11px] font-semibold">
                {v.label}
              </div>
              <div className="text-[10px] tabular-nums text-muted-foreground">
                {v.missing ? "—" : `${v.n} org`}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
