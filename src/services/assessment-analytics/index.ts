import { api } from "@/lib/api";
import type { PivotResult, SavedView } from "@hrms/assessment-analytics";

export type AnalyticsViewRecord = {
  id: string;
  name: string;
  is_preset: boolean;
  preset_key: string | null;
  config: SavedView;
  created_at?: string;
  updated_at?: string;
};

export type FieldsResponse = {
  formId: string;
  definitionHash: string | null;
  sections: Array<{
    section: string;
    fields: Array<{
      field: string;
      field_key: string;
      label: string;
      data_type: string;
      usable_as_dimension: boolean;
      usable_as_measure: boolean;
      is_scorable: boolean;
      options: unknown;
    }>;
  }>;
};

type ApiWrap<T> = { data: T; message?: string; status?: string };

export type AnalyticsFormCategory = "self" | "supervisor" | "offboarding";

export type AnalyticsFormOption = {
  id: string;
  name: string;
  code: string | null;
  type?: number;
  definitionHash: string | null;
  category?: AnalyticsFormCategory;
};

export async function fetchAnalyticsForms(
  category?: AnalyticsFormCategory,
): Promise<AnalyticsFormOption[]> {
  const res = await api
    .get("assessment-analytics/forms", {
      searchParams: category ? { category } : undefined,
    })
    .json<ApiWrap<AnalyticsFormOption[]>>();
  return res.data;
}

export async function fetchAnalyticsViews(): Promise<AnalyticsViewRecord[]> {
  const res = await api
    .get("assessment-analytics/views")
    .json<ApiWrap<AnalyticsViewRecord[]>>();
  return res.data;
}

export async function fetchAnalyticsFields(formId: string): Promise<FieldsResponse> {
  const res = await api
    .get("assessment-analytics/fields", { searchParams: { formId } })
    .json<ApiWrap<FieldsResponse>>();
  return res.data;
}

export async function queryPivot(view: SavedView): Promise<PivotResult> {
  const res = await api
    .post("assessment-analytics/query", { json: view })
    .json<ApiWrap<PivotResult>>();
  return res.data;
}

export async function drillPivot(
  view: SavedView,
  dims: Record<string, string>,
  page = 1,
): Promise<{
  data: Array<{
    employee_id: number;
    employee_name: string;
    department: string | null;
    job_level: string | null;
    position: string | null;
    raw_score: number | null;
    period_key: string | null;
    submitted_at: string | null;
  }>;
  meta: { total: number; scoreSource: string };
}> {
  const res = await api
    .post("assessment-analytics/drill", {
      json: { view, dims, page, per_page: 50 },
    })
    .json<ApiWrap<{ data: never[]; meta: { total: number; scoreSource: string } }>>();
  return res.data;
}

export async function saveAnalyticsView(
  name: string,
  config: SavedView,
): Promise<AnalyticsViewRecord> {
  const res = await api
    .post("assessment-analytics/views", { json: { name, config } })
    .json<ApiWrap<AnalyticsViewRecord>>();
  return res.data;
}

export async function exportPivotXlsx(view: SavedView): Promise<Blob> {
  return api.post("assessment-analytics/export", { json: { view } }).blob();
}
