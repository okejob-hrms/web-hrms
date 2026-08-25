import type { RendererSpec, SavedView } from "../contracts";

function reason(
  id: string,
  cfg: SavedView,
  needs: { rows?: [number, number]; columns?: [number, number]; measures?: [number, number] },
): string {
  const r = cfg.rows.length;
  const c = cfg.columns.length;
  const m = cfg.values.length;
  const parts: string[] = [];
  if (needs.rows && (r < needs.rows[0] || r > needs.rows[1])) {
    parts.push(`baris ${needs.rows[0]}–${needs.rows[1]}`);
  }
  if (needs.columns && (c < needs.columns[0] || c > needs.columns[1])) {
    parts.push(`kolom ${needs.columns[0]}–${needs.columns[1]}`);
  }
  if (needs.measures && (m < needs.measures[0] || m > needs.measures[1])) {
    parts.push(`nilai ${needs.measures[0]}–${needs.measures[1]}`);
  }
  if (!parts.length) return "";
  return `Grafik ${id} membutuhkan ${parts.join(", ")}.`;
}

/**
 * Phase 1 renderer registry interface (§4.3).
 * Chart engines register here; the query layer must not reference these ids.
 */
export const RENDERER_REGISTRY: RendererSpec[] = [
  {
    id: "column",
    label: "Kolom",
    accepts: { rows: [1, 1], columns: [0, 0], measures: [1, 1] },
    reasonWhenInvalid: (cfg) => reason("Kolom", cfg, { rows: [1, 1], columns: [0, 0], measures: [1, 1] }),
  },
  {
    id: "bar",
    label: "Batang",
    accepts: { rows: [1, 1], columns: [0, 0], measures: [1, 1] },
    reasonWhenInvalid: (cfg) => reason("Batang", cfg, { rows: [1, 1], columns: [0, 0], measures: [1, 1] }),
  },
  {
    id: "column_stacked",
    label: "Bertumpuk",
    accepts: { rows: [1, 1], columns: [1, 1], measures: [1, 1] },
    reasonWhenInvalid: (cfg) =>
      reason("Bertumpuk", cfg, { rows: [1, 1], columns: [1, 1], measures: [1, 1] }),
  },
  {
    id: "column_grouped",
    label: "Berkelompok",
    accepts: { rows: [1, 1], columns: [1, 1], measures: [1, 1] },
    reasonWhenInvalid: (cfg) =>
      reason("Berkelompok", cfg, { rows: [1, 1], columns: [1, 1], measures: [1, 1] }),
  },
  {
    id: "line",
    label: "Garis",
    accepts: { rows: [1, 1], columns: [0, 1], measures: [1, 1] },
    reasonWhenInvalid: (cfg) => reason("Garis", cfg, { rows: [1, 1], columns: [0, 1], measures: [1, 1] }),
  },
  {
    id: "pie",
    label: "Lingkaran",
    accepts: { rows: [1, 1], columns: [0, 0], measures: [1, 1] },
    reasonWhenInvalid: (cfg) => reason("Lingkaran", cfg, { rows: [1, 1], columns: [0, 0], measures: [1, 1] }),
  },
  {
    id: "table",
    label: "Tabel",
    accepts: { rows: [0, 3], columns: [0, 3], measures: [1, 5] },
    reasonWhenInvalid: (cfg) => reason("Tabel", cfg, { measures: [1, 5] }),
  },
  {
    id: "scorecard",
    label: "Kartu skor",
    accepts: { rows: [0, 0], columns: [0, 0], measures: [1, 1] },
    reasonWhenInvalid: (cfg) => reason("Kartu skor", cfg, { rows: [0, 0], columns: [0, 0], measures: [1, 1] }),
  },
];

export function getRenderer(id: string): RendererSpec | undefined {
  return RENDERER_REGISTRY.find((r) => r.id === id);
}

export function isRendererValid(cfg: SavedView): boolean {
  const spec = getRenderer(cfg.render.type);
  if (!spec) return false;
  const { rows, columns, measures } = spec.accepts;
  const r = cfg.rows.length;
  const c = cfg.columns.length;
  const m = cfg.values.length;
  return r >= rows[0] && r <= rows[1] && c >= columns[0] && c <= columns[1] && m >= measures[0] && m <= measures[1];
}
