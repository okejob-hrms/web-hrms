"use client";

import type { PivotResult } from "@hrms/assessment-analytics";
import { gradeColor } from "./colors";

type Props = {
  result: PivotResult;
  onDrill?: (dims: Record<string, string>) => void;
};

export function TableRenderer({ result, onDrill }: Props) {
  const rowDim = result.dimensions.find((d) => d.role === "row");
  const colDim = result.dimensions.find((d) => d.role === "column");
  const measureKey = result.measures[0]?.key ?? "m0";
  const measureLabel = result.measures[0]?.label ?? "Nilai";

  if (!rowDim) return null;

  if (!colDim) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-[11px] uppercase tracking-wide text-[#a8a49e]">
            <th className="px-3 py-2">{rowDim.label}</th>
            <th className="px-3 py-2">{measureLabel}</th>
            <th className="px-3 py-2">n</th>
          </tr>
        </thead>
        <tbody>
          {rowDim.members.map((m, i) => {
            const row = result.rows.find((r) => r.dims[rowDim.key] === m.key);
            return (
              <tr
                key={m.key}
                className="cursor-pointer border-b border-[#efeeeb] hover:bg-[#f7f7f6]"
                onClick={() => !row?.suppressed && onDrill?.({ [rowDim.key]: m.key })}
              >
                <td className="px-3 py-2 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ background: gradeColor(m.label, i) }}
                    />
                    {m.label}
                  </span>
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {row?.suppressed ? "—" : (row?.values[measureKey] ?? "—")}
                </td>
                <td className="px-3 py-2 tabular-nums text-[#8a8680]">{row?.n ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b text-left text-[11px] uppercase tracking-wide text-[#a8a49e]">
            <th className="px-3 py-2">{rowDim.label}</th>
            {colDim.members.map((c) => (
              <th key={c.key} className="px-3 py-2">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowDim.members.map((r) => (
            <tr key={r.key} className="border-b border-[#efeeeb]">
              <td className="px-3 py-2 font-medium">{r.label}</td>
              {colDim.members.map((c) => {
                const row = result.rows.find(
                  (x) =>
                    x.dims[rowDim.key] === r.key && x.dims[colDim.key] === c.key,
                );
                return (
                  <td
                    key={c.key}
                    className="cursor-pointer px-3 py-2 tabular-nums hover:bg-[#f7f7f6]"
                    onClick={() =>
                      !row?.suppressed &&
                      onDrill?.({ [rowDim.key]: r.key, [colDim.key]: c.key })
                    }
                  >
                    {row?.suppressed ? "—" : (row?.values[measureKey] ?? "—")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
