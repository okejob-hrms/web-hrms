"use client";

import type { PivotResult } from "@hrms/assessment-analytics";
import { gradeColor } from "./colors";

type Props = {
  result: PivotResult;
  grouped?: boolean;
  onDrill?: (dims: Record<string, string>) => void;
};

export function StackedChart({ result, grouped, onDrill }: Props) {
  const rowDim = result.dimensions.find((d) => d.role === "row");
  const colDim = result.dimensions.find((d) => d.role === "column");
  const measureKey = result.measures[0]?.key ?? "m0";
  if (!rowDim || !colDim) return null;

  const rows = rowDim.members;
  const cols = colDim.members;

  const cell = (rk: string, ck: string) =>
    result.rows.find(
      (r) => r.dims[rowDim.key] === rk && r.dims[colDim.key] === ck,
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs">
        {cols.map((c, i) => (
          <span key={c.key} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: gradeColor(c.label, i) }}
            />
            {c.label}
          </span>
        ))}
      </div>
      <div className="space-y-3">
        {rows.map((r) => {
          const segments = cols.map((c, i) => {
            const row = cell(r.key, c.key);
            return {
              key: c.key,
              label: c.label,
              value: row?.suppressed ? null : Number(row?.values[measureKey] ?? 0),
              n: row?.n ?? 0,
              suppressed: row?.suppressed ?? false,
              color: gradeColor(c.label, i),
            };
          });
          const total = segments.reduce(
            (s, x) => s + (typeof x.value === "number" ? x.value : 0),
            0,
          );
          const rowMax = Math.max(
            1,
            ...segments.map((x) =>
              typeof x.value === "number" ? x.value : 0,
            ),
          );
          return (
            <div key={r.key} className="grid grid-cols-[140px_1fr_48px] items-center gap-3">
              <div className="truncate text-sm font-semibold text-[#3f3b36]">{r.label}</div>
              <div className={`flex h-8 overflow-hidden rounded-md ${grouped ? "gap-0.5" : ""}`}>
                {segments.map((seg) => {
                  const width = grouped
                    ? `${seg.value != null ? (seg.value / rowMax) * 100 : 0}%`
                    : `${total > 0 && seg.value != null ? (seg.value / total) * 100 : 0}%`;
                  return (
                    <button
                      key={seg.key}
                      type="button"
                      disabled={seg.suppressed || !seg.value}
                      title={`${seg.label}: ${seg.suppressed ? "—" : seg.value}`}
                      onClick={() =>
                        onDrill?.({ [rowDim.key]: r.key, [colDim.key]: seg.key })
                      }
                      className="h-full min-w-0 disabled:cursor-not-allowed"
                      style={{
                        width,
                        background: seg.suppressed
                          ? "repeating-linear-gradient(135deg,#ddd 0 3px,#eee 3px 6px)"
                          : seg.color,
                      }}
                    />
                  );
                })}
              </div>
              <div className="text-right text-[11px] tabular-nums text-[#a8a49e]">
                {segments.reduce((s, x) => s + x.n, 0)} org
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
