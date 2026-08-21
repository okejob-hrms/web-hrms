/**
 * Lane 0 freeze — Assessment Analytics Engine contracts.
 * Authority: Build Brief v2 §4. Do not diverge without a brief update.
 */

export type ScoreSource = "supervisor_final" | "self";

export type ScoreScale = "pct_0_100" | "weighted_x5";

/** Field refs: "org.department" | "score.raw" | "score.grade" | "form.{field_key}" */
export type FieldRef = string;

export type BandTransform =
  | { type: "band"; thresholdSetSource: ScoreSource }
  | {
      type: "band";
      bands: Array<{
        label: string;
        min: number | null;
        max: number | null;
      }>;
    };

export type DateTruncTransform = {
  type: "date_trunc";
  unit: "month" | "quarter" | "year";
};

export type ShelfField = {
  field: FieldRef;
  transform?: BandTransform | DateTruncTransform;
  sort?: { by: "label" | "value" | "custom"; dir: "asc" | "desc" };
  limit?: { topN: number; otherBucket: boolean };
};

export type MeasureField = {
  field: FieldRef;
  agg: "count" | "count_distinct" | "sum" | "avg" | "min" | "max" | "median";
  showAs?: "raw" | "pct_of_grand_total" | "pct_of_row" | "pct_of_column";
  format?: { decimals: number; suffix?: string };
};

export type FilterClause = {
  field: FieldRef;
  op: "in" | "not_in" | "eq" | "between";
  values: Array<string | number | null>;
};

export type SavedView = {
  version: 1;
  id: string;
  name: string;
  source: {
    formId: string;
    definitionHash: string;
    /** Required. Never omit; server throws if missing. */
    scoreSource: ScoreSource;
    periodKeys: string[];
  };
  rows: ShelfField[];
  columns: ShelfField[];
  values: MeasureField[];
  filters: FilterClause[];
  options: {
    includeIncomplete: boolean;
    suppression: { enabled: boolean; minN: number };
    totals: { rows: boolean; columns: boolean };
  };
  render: {
    type: string;
    overlays?: Array<{ type: "normal_curve"; sourceField: string }>;
    options?: Record<string, unknown>;
  };
};

export type DimensionMember = {
  key: string;
  label: string;
  order: number;
  isSpecial?: "ungraded" | "out_of_range" | "other";
};

export type PivotResult = {
  dimensions: Array<{
    key: string;
    label: string;
    role: "row" | "column";
    members: DimensionMember[];
  }>;
  measures: Array<{
    key: string;
    label: string;
    agg: string;
    format: Record<string, unknown>;
  }>;
  rows: Array<{
    dims: Record<string, string>;
    /** null = suppressed, never 0 for a suppressed cell */
    values: Record<string, number | null>;
    n: number;
    suppressed: boolean;
  }>;
  totals: { row?: unknown; column?: unknown; grand?: unknown };
  meta: {
    grain: "submission";
    scoreSource: ScoreSource;
    scoreScale: ScoreScale;
    appliedThresholdSource?: ScoreSource;
    totalFacts: number;
    excludedIncomplete: number;
    suppressedCells: number;
    orgSnapshotCoverage: {
      captured: number;
      backfilledCurrent: number;
    };
    definitionHashMatch: boolean;
    warnings: string[];
  };
};

export type RendererSpec = {
  id: string;
  label: string;
  accepts: {
    rows: [number, number];
    columns: [number, number];
    measures: [number, number];
  };
  reasonWhenInvalid: (cfg: SavedView) => string;
};

/**
 * period_key derivation (Lane 0 decision — Build Brief §11.3)
 *
 * Self facts:
 *   `{assessment_period}_{year}` from parent `self_assessments`
 *   e.g. `Q1_2026` (matches unique business key + UI "Q1 2026")
 *
 * Supervisor facts (no cycle FK exists):
 *   calendar quarter of coalesce(final merging submission updated_at, SA.updated_at)
 *   e.g. `2026_Q1`
 *
 * Period filters accept multiple keys; "all periods" = empty periodKeys array
 * is NOT allowed — pass every known key or omit filter via empty means
 * "no period restriction" only when periodKeys is explicitly `[]` with
 * product confirmation. Default SavedView seeds list concrete keys.
 */
export type PeriodKey = string;
