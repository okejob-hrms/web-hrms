"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  BarChart3,
  BarChartHorizontal,
  ChartColumn,
  ChartColumnStacked,
  ChartPie,
  ChevronDown,
  Download,
  LayoutTemplate,
  LineChart,
  Loader2,
  Plus,
  Settings2,
  Table2,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import type {
  MeasureField,
  SavedView,
} from "@hrms/assessment-analytics";
import { RENDERER_REGISTRY } from "@hrms/assessment-analytics";
import {
  drillPivot,
  exportPivotXlsx,
  fetchAnalyticsForms,
  fetchAnalyticsViews,
  type AnalyticsFormCategory,
  type AnalyticsFormOption,
  type AnalyticsViewRecord,
} from "@/services/assessment-analytics";
import { useSavedView } from "@/lib/assessment-analytics/hooks/useSavedView";
import { usePivotQuery } from "@/lib/assessment-analytics/hooks/usePivotQuery";
import { PivotRenderer } from "@/lib/assessment-analytics/renderers/PivotRenderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/tables/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Screen = "list" | "builder" | "canvas";
type ShelfKey = "rows" | "columns" | "values" | "filters";

const DRAG_MIME = "application/x-aa-field";

const CHART_TYPE_ICONS: Record<string, LucideIcon> = {
  column: ChartColumn,
  bar: BarChartHorizontal,
  column_stacked: ChartColumnStacked,
  column_grouped: BarChart3,
  line: LineChart,
  pie: ChartPie,
  table: Table2,
};

const SOURCE_LABEL: Record<string, string> = {
  supervisor_final: "Supervisor assessment",
  self: "Self assessment",
};

const DRILL_PAGE_SIZE = 50;
const FORM_TYPE_EXIT_INTERVIEW = 1;

function categoryFromView(
  scoreSource: string,
  formType?: number,
): AnalyticsFormCategory {
  if (formType === FORM_TYPE_EXIT_INTERVIEW) return "offboarding";
  return scoreSource === "supervisor_final" ? "supervisor" : "self";
}

function resolveFormCategory(
  scoreSource: string,
  formId: string | number | undefined,
  catalog: AnalyticsFormOption[],
): AnalyticsFormCategory {
  const form = catalog.find((f) => f.id === String(formId));
  if (form?.type === FORM_TYPE_EXIT_INTERVIEW) return "offboarding";
  if (form?.category) return form.category;
  return categoryFromView(scoreSource, form?.type);
}

function scoreSourceForCategory(
  category: AnalyticsFormCategory,
): "self" | "supervisor_final" {
  return category === "supervisor" ? "supervisor_final" : "self";
}

function formatForShowAs(
  showAs: MeasureField["showAs"],
  field = "count",
): MeasureField["format"] {
  const isPct =
    showAs === "pct_of_grand_total" ||
    showAs === "pct_of_row" ||
    showAs === "pct_of_column";
  if (field === "score.raw" || field === "score") {
    return { decimals: 1, ...(isPct ? { suffix: "%" } : {}) };
  }
  return isPct ? { decimals: 1, suffix: "%" } : { decimals: 0 };
}

function measureForField(field: string, showAs?: MeasureField["showAs"]): MeasureField {
  if (field === "score.raw" || field === "score") {
    const resolvedShowAs = showAs ?? "raw";
    return {
      field: "score.raw",
      agg: "avg",
      showAs: resolvedShowAs,
      format: formatForShowAs(resolvedShowAs, "score.raw"),
    };
  }
  const resolvedShowAs = showAs ?? "pct_of_grand_total";
  return {
    field: "count",
    agg: "count",
    showAs: resolvedShowAs,
    format: formatForShowAs(resolvedShowAs, "count"),
  };
}

function isMeasureField(field: string): boolean {
  return field === "count" || field === "score.raw" || field === "score";
}

function isDualAxisRender(type: string): boolean {
  return type === "column_stacked" || type === "column_grouped";
}

function addFieldToShelf(
  view: SavedView,
  field: string,
  shelf: ShelfKey,
): Partial<SavedView> {
  if (
    (shelf === "rows" || shelf === "columns" || shelf === "filters") &&
    isMeasureField(field)
  ) {
    return addFieldToShelf(view, field, "values");
  }

  const rows = view.rows.filter((r) => r.field !== field);
  const columns = view.columns.filter((c) => c.field !== field);
  const filters = view.filters.filter((f) => f.field !== field);

  if (shelf === "rows") {
    return {
      rows: [{ field }],
      columns,
      filters,
      render: {
        ...view.render,
        type:
          columns.length > 0
            ? view.render.type === "table"
              ? "table"
              : "column_stacked"
            : isDualAxisRender(view.render.type)
              ? "column"
              : view.render.type,
      },
    };
  }

  if (shelf === "columns") {
    return {
      rows,
      columns: [{ field }],
      filters,
      render: {
        ...view.render,
        type:
          view.render.type === "table"
            ? "table"
            : rows.length > 0
              ? "column_stacked"
              : view.render.type,
      },
    };
  }

  if (shelf === "values") {
    return { values: [measureForField(field)] };
  }

  // Filters require a value picker — block drops until that UI exists.
  return {};
}

function smartAddField(view: SavedView, field: string): Partial<SavedView> {
  if (field === "score.raw" || field === "count") {
    return addFieldToShelf(view, field, "values");
  }
  if (!view.rows.length) return addFieldToShelf(view, field, "rows");
  if (!view.columns.length) return addFieldToShelf(view, field, "columns");
  return addFieldToShelf(view, field, "rows");
}

export default function AssessmentAnalytics() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const [screen, setScreen] = React.useState<Screen>("list");
  const [showPresets, setShowPresets] = React.useState(false);
  const [dragField, setDragField] = React.useState<string | null>(null);
  const [dragOverShelf, setDragOverShelf] = React.useState<ShelfKey | null>(
    null,
  );
  const [drill, setDrill] = React.useState<{
    dims: Record<string, string>;
    rows: Awaited<ReturnType<typeof drillPivot>>["data"];
    total: number;
    page: number;
  } | null>(null);
  const drillSeqRef = React.useRef(0);
  const [drillLoading, setDrillLoading] = React.useState(false);
  // Keep dialog open even when no data loaded yet (shows loading spinner)
  const [drillOpen, setDrillOpen] = React.useState(false);

  const { data: views = [], isLoading: viewsLoading } = useQuery({
    queryKey: ["assessment-analytics-views"],
    queryFn: fetchAnalyticsViews,
  });

  const { view, replace, patch } = useSavedView();

  const [formCategory, setFormCategory] =
    React.useState<AnalyticsFormCategory>(() =>
      categoryFromView(view.source.scoreSource),
    );

  const { data: formCatalog = [] } = useQuery({
    queryKey: ["assessment-analytics-forms", "catalog"],
    queryFn: () => fetchAnalyticsForms(),
    staleTime: 5 * 60 * 1000,
  });

  React.useEffect(() => {
    setFormCategory(
      resolveFormCategory(
        view.source.scoreSource,
        view.source.formId,
        formCatalog,
      ),
    );
  }, [view.id, view.source.scoreSource, view.source.formId, formCatalog]);

  const {
    data: forms = [],
    isSuccess: formsReady,
    isFetching: formsFetching,
  } = useQuery({
    queryKey: ["assessment-analytics-forms", formCategory],
    queryFn: () => fetchAnalyticsForms(formCategory),
  });

  const { data: result, loading, error } = usePivotQuery(
    view.source.formId && formCategory !== "offboarding" ? view : null,
    screen !== "list" && formCategory !== "offboarding",
  );

  const openView = (record: AnalyticsViewRecord) => {
    replace({ ...record.config, id: record.id, name: record.name });
    setFormCategory(
      resolveFormCategory(
        record.config.source.scoreSource,
        record.config.source.formId,
        formCatalog,
      ),
    );
    setScreen("builder");
    setShowPresets(false);
  };

  const sourceLabel =
    SOURCE_LABEL[view.source.scoreSource] ?? view.source.scoreSource;

  const categoryLabel =
    formCategory === "supervisor"
      ? t("analyticsCategorySupervisor")
      : formCategory === "offboarding"
        ? t("analyticsCategoryOffboarding")
        : t("analyticsCategorySelf");

  const formLabel =
    forms.find((f) => f.id === String(view.source.formId))?.name ??
    (view.source.formId
      ? `Form #${view.source.formId}`
      : t("analyticsSelectForm"));

  const formOptions = React.useMemo(
    () => forms.map((f) => ({ value: f.id, label: f.name })),
    [forms],
  );

  const applyCategory = (category: AnalyticsFormCategory) => {
    setFormCategory(category);
    // Form list will refetch; pick first form once loaded via effect below
    patch({
      source: {
        ...view.source,
        scoreSource: scoreSourceForCategory(category),
        formId: "",
        definitionHash: "",
      },
    });
  };

  // When forms for the category load, ensure a valid formId is selected
  React.useEffect(() => {
    if (formCategory === "offboarding") return;
    if (!formsReady || formsFetching) return;
    if (!forms.length) return;
    const currentOk = forms.some((f) => f.id === String(view.source.formId));
    if (currentOk) return;
    const first = forms[0];
    patch({
      source: {
        ...view.source,
        formId: first.id,
        definitionHash: first.definitionHash ?? "",
        scoreSource: scoreSourceForCategory(formCategory),
      },
    });
  }, [
    forms,
    formCategory,
    formsReady,
    formsFetching,
    view.source.formId,
    patch,
    view.source,
  ]);

  const loadDrill = React.useCallback(
    async (dims: Record<string, string>, page = 1) => {
      const seq = ++drillSeqRef.current;
      setDrillLoading(true);
      setDrillOpen(true);
      try {
        const res = await drillPivot(view, dims, page);
        if (seq !== drillSeqRef.current) return;
        setDrill({ dims, rows: res.data, total: res.meta.total, page });
      } catch {
        if (seq !== drillSeqRef.current) return;
        toast.error(t("analyticsDrillFailed"));
      } finally {
        setDrillLoading(false);
      }
    },
    [t, view],
  );

  const onDrill = (dims: Record<string, string>) => {
    void loadDrill(dims, 1);
  };

  const onExport = async () => {
    try {
      const blob = await exportPivotXlsx(view);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${view.name || "analysis"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(t("analyticsExportFailed"));
    }
  };

  const measureLabel =
    view.values[0]?.agg === "count" || view.values[0]?.field === "count"
      ? t("analyticsHeadcount")
      : view.values[0]?.agg === "avg"
        ? t("analyticsAvgScore")
        : t("analyticsScore");
  const group1Label = fieldLabel(view.rows[0]?.field, t);
  const group2Label = view.columns[0]
    ? fieldLabel(view.columns[0].field, t)
    : null;
  const displayMode = view.values[0]?.showAs ?? "raw";
  const displayLabel =
    displayMode === "pct_of_grand_total"
      ? t("analyticsPctTotal")
      : displayMode === "pct_of_row"
        ? t("analyticsPctRow")
        : displayMode === "pct_of_column"
          ? t("analyticsPctCol")
          : t("analyticsRaw");

  const groupFieldOptions = React.useMemo(
    () => [
      { value: "score.grade", label: "Grade" },
      { value: "org.department", label: t("analyticsDivision") },
      { value: "org.job_level", label: t("analyticsJobLevel") },
      { value: "period", label: t("analyticsPeriod") },
    ],
    [t],
  );

  const periodOptions = React.useMemo(() => {
    const fromResult =
      result?.dimensions
        .find((d) => d.key === "period")
        ?.members.map((m) => m.key) ?? [];
    const keys = Array.from(
      new Set([...view.source.periodKeys, ...fromResult]),
    );
    return [
      { value: "__all__", label: t("analyticsAllPeriods") },
      ...keys.map((k) => ({ value: k, label: k })),
    ];
  }, [result, t, view.source.periodKeys]);

  const NONE = "__none__";

  const setGroupField = (role: "rows" | "columns", field: string) => {
    const resolved = field === NONE ? "" : field;
    if (!resolved) {
      if (role === "rows") {
        patch({ rows: [] });
      } else {
        patch({
          columns: [],
          render: {
            ...view.render,
            type:
              isDualAxisRender(view.render.type)
                ? "column"
                : view.render.type,
          },
        });
      }
      return;
    }
    patch(addFieldToShelf(view, resolved, role));
  };

  const drillColumns = React.useMemo<
    ColumnDef<Awaited<ReturnType<typeof drillPivot>>["data"][number]>[]
  >(
    () => [
      {
        accessorKey: "employee_name",
        header: t("analyticsDrillEmployee"),
        cell: ({ row }) => row.original.employee_name || "—",
      },
      {
        accessorKey: "position",
        header: tCommon("position"),
        cell: ({ row }) => row.original.position || "—",
      },
      {
        accessorKey: "department",
        header: tCommon("department"),
        cell: ({ row }) => row.original.department || "—",
      },
      {
        accessorKey: "raw_score",
        header: t("analyticsScore"),
        cell: ({ row }) =>
          row.original.raw_score != null
            ? Number(row.original.raw_score).toFixed(2)
            : "—",
      },
    ],
    [t, tCommon],
  );

  if (screen === "list") {
    return (
      <div className="space-y-6 py-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t("analyticsBuilderTitle")}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {t("analyticsBuilderHint")}
            </p>
          </div>
          <Button onClick={() => setShowPresets(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("analyticsAddAnalysis")}
          </Button>
        </div>

        {viewsLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("analyticsLoading")}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => openView(v)}
                className="rounded-xl bg-white p-4 text-left shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold">{v.name}</div>
                  {v.is_preset && (
                    <Badge
                      variant="outline"
                      className="shrink-0 border-primary/20 bg-primary-background text-[10px] text-primary"
                    >
                      {t("analyticsTemplate")}
                    </Badge>
                  )}
                </div>
                <div className="mt-3 flex h-[88px] items-center justify-center rounded-lg bg-primary-background text-xs text-muted-foreground">
                  <LayoutTemplate className="mr-2 h-4 w-4" />
                  {SOURCE_LABEL[v.config.source.scoreSource] ??
                    v.config.source.scoreSource}
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowPresets(true)}
              className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-xl border border-primary bg-primary/10 text-primary"
            >
              <Plus size={32} />
              <div className="font-semibold">{t("analyticsAddAnalysis")}</div>
              <div className="px-6 text-center text-sm text-muted-foreground">
                {t("analyticsAddAnalysisHint")}
              </div>
            </button>
          </div>
        )}

        <PresetDialog
          open={showPresets}
          onOpenChange={setShowPresets}
          views={views.filter((v) => v.is_preset)}
          onSelect={openView}
          title={t("analyticsTemplatesTitle")}
          description={t("analyticsTemplatesHint")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setScreen(screen === "canvas" ? "builder" : "list")}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          {screen === "canvas" ? t("analyticsBackBuilder") : t("analyticsBack")}
        </Button>
        <h2 className="text-base font-semibold">
          {screen === "canvas" ? t("analyticsPivotCanvas") : view.name}
        </h2>
        <div className="flex-1" />
        <Badge
          variant="outline"
          className="border-primary/20 bg-primary-background text-primary"
        >
          {sourceLabel}
        </Badge>
        {screen === "builder" && (
          <>
            <Button variant="outline" size="sm" onClick={() => setShowPresets(true)}>
              {t("analyticsChangeTemplate")}
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-1.5 h-4 w-4" />
              Excel
            </Button>
            <Button size="sm" onClick={() => setScreen("canvas")}>
              <Settings2 className="mr-1.5 h-4 w-4" />
              {t("analyticsAdvanced")}
            </Button>
          </>
        )}
      </div>

      {screen === "builder" && (
        <>
          <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm text-sm leading-relaxed">
            <p className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
              {t("analyticsShow")}{" "}
              <ConfigChip
                value={
                  view.values[0]?.agg === "avg" ||
                  view.values[0]?.field === "score.raw"
                    ? "avg"
                    : "count"
                }
                options={[
                  { value: "count", label: t("analyticsHeadcount") },
                  { value: "avg", label: t("analyticsAvgScore") },
                ]}
                onSelect={(value) => {
                  if (value === "avg") {
                    patch({
                      values: [
                        {
                          ...measureForField("score.raw"),
                          showAs: "raw",
                        },
                      ],
                    });
                    return;
                  }
                  patch({
                    values: [
                      measureForField(
                        "count",
                        displayMode === "raw" ? "raw" : displayMode,
                      ),
                    ],
                  });
                }}
              >
                {measureLabel}
              </ConfigChip>
            </p>
            <p className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
              {t("analyticsGroupedBy")}{" "}
              <ConfigChip
                value={view.rows[0]?.field ?? NONE}
                options={[
                  { value: NONE, label: t("analyticsNone") },
                  ...groupFieldOptions,
                ]}
                onSelect={(value) => setGroupField("rows", value)}
              >
                {group1Label === "—" ? t("analyticsSelectField") : group1Label}
              </ConfigChip>
              {group2Label ? (
                <>
                  {" "}
                  {t("analyticsAnd")}{" "}
                  <ConfigChip
                    value={view.columns[0]?.field ?? NONE}
                    options={[
                      { value: NONE, label: t("analyticsNone") },
                      ...groupFieldOptions.filter(
                        (o) => o.value !== view.rows[0]?.field,
                      ),
                    ]}
                    onSelect={(value) => setGroupField("columns", value)}
                    onRemove={() => setGroupField("columns", NONE)}
                  >
                    {group2Label}
                  </ConfigChip>
                </>
              ) : (
                <ConfigChip
                  value={NONE}
                  options={groupFieldOptions.filter(
                    (o) => o.value !== view.rows[0]?.field,
                  )}
                  onSelect={(value) => setGroupField("columns", value)}
                  variant="ghost"
                >
                  <Plus className="h-3 w-3" />
                  {t("analyticsAddGroup")}
                </ConfigChip>
              )}
            </p>
            <p className="flex flex-wrap items-center gap-x-1 gap-y-1.5">
              {view.values[0]?.field === "score.raw" ||
              view.values[0]?.field === "score" ? (
                <span className="text-xs text-muted-foreground">
                  {t("analyticsDisplayedAs")}
                </span>
              ) : (
                <>
                  {t("analyticsDisplayedAs")}{" "}
                  <ConfigChip
                    value={displayMode}
                    options={[
                      { value: "raw", label: t("analyticsRaw") },
                      { value: "pct_of_row", label: t("analyticsPctRow") },
                      { value: "pct_of_column", label: t("analyticsPctCol") },
                      {
                        value: "pct_of_grand_total",
                        label: t("analyticsPctTotal"),
                      },
                    ]}
                    onSelect={(value) => {
                      const current = view.values[0] ?? measureForField("count");
                      const showAs = value as MeasureField["showAs"];
                      patch({
                        values: [
                          {
                            ...current,
                            showAs,
                            format: formatForShowAs(showAs, current.field),
                          },
                        ],
                      });
                    }}
                  >
                    {displayLabel}
                  </ConfigChip>
                </>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-x-1 gap-y-1.5 border-t border-border pt-3 text-sm">
              {t("analyticsCategory")}{" "}
              <ConfigChip
                value={formCategory}
                options={[
                  {
                    value: "self",
                    label: t("analyticsCategorySelf"),
                  },
                  {
                    value: "supervisor",
                    label: t("analyticsCategorySupervisor"),
                  },
                  {
                    value: "offboarding",
                    label: t("analyticsCategoryOffboarding"),
                  },
                ]}
                onSelect={(value) =>
                  applyCategory(value as AnalyticsFormCategory)
                }
              >
                {categoryLabel}
              </ConfigChip>
              <span className="mx-2 text-muted-foreground">·</span>
              {t("analyticsForm")}{" "}
              <ConfigChip
                value={String(view.source.formId || "")}
                options={
                  formOptions.length
                    ? formOptions
                    : [
                        {
                          value: String(view.source.formId || "__none__"),
                          label: t("analyticsSelectForm"),
                        },
                      ]
                }
                onSelect={(value) => {
                  if (value === "__none__") return;
                  const selected = forms.find((f) => f.id === value);
                  patch({
                    source: {
                      ...view.source,
                      formId: value,
                      definitionHash: selected?.definitionHash ?? "",
                      scoreSource: scoreSourceForCategory(formCategory),
                    },
                  });
                }}
              >
                {formOptions.length ? formLabel : t("analyticsSelectForm")}
              </ConfigChip>
              <span className="mx-2 text-muted-foreground">·</span>
              {t("analyticsPeriod")}{" "}
              <ConfigChip
                value={view.source.periodKeys[0] ?? "__all__"}
                options={periodOptions}
                onSelect={(value) =>
                  patch({
                    source: {
                      ...view.source,
                      periodKeys: value && value !== "__all__" ? [value] : [],
                    },
                  })
                }
              >
                {view.source.periodKeys.length
                  ? view.source.periodKeys.join(", ")
                  : t("analyticsAllPeriods")}
              </ConfigChip>
            </div>
          </div>

          {formCategory === "offboarding" ? (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {t("analyticsOffboardingUnsupported")}
            </div>
          ) : (
            <MetaBadges result={result} sourceLabel={sourceLabel} t={t} />
          )}

          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 text-sm font-semibold">{t("analyticsLivePreview")}</div>
            {formCategory === "offboarding" ? (
              <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
                {t("analyticsOffboardingUnsupported")}
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <PivotRenderer
                  view={view}
                  result={result}
                  loading={loading}
                  onDrill={onDrill}
                />
              </>
            )}
          </div>
        </>
      )}

      {screen === "canvas" && (
        <div className="grid gap-4 lg:grid-cols-[220px_1fr_140px]">
          <div className="space-y-1 rounded-xl bg-white p-3 shadow-sm">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("analyticsQuickFields")}
            </div>
            {[
              { label: "Grade", field: "score.grade" },
              { label: t("analyticsDivision"), field: "org.department" },
              { label: t("analyticsJobLevel"), field: "org.job_level" },
              { label: t("analyticsPeriod"), field: "period" },
              { label: t("analyticsHeadcount"), field: "count" },
              { label: t("analyticsAvgScore"), field: "score.raw" },
            ].map((f) => (
              <button
                key={f.field}
                type="button"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(DRAG_MIME, f.field);
                  e.dataTransfer.effectAllowed = "copy";
                  setDragField(f.field);
                }}
                onDragEnd={() => {
                  setDragField(null);
                  setDragOverShelf(null);
                }}
                onClick={() => patch(smartAddField(view, f.field))}
                className="flex h-8 w-full cursor-grab items-center justify-between rounded-md px-2 text-left text-sm hover:bg-muted active:cursor-grabbing"
              >
                {f.label}
                <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            ))}
            <p className="px-1 pt-2 text-[11px] leading-snug text-muted-foreground">
              {t("analyticsDragHint")}
            </p>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <DropShelf
                shelf="rows"
                title={t("analyticsRows")}
                hint={t("analyticsDragHint")}
                active={dragOverShelf === "rows"}
                dragging={!!dragField}
                pills={view.rows.map((r) => ({
                  id: r.field,
                  label: fieldLabel(r.field, t),
                }))}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverShelf("rows");
                }}
                onDragLeave={() => setDragOverShelf(null)}
                onDrop={(field) => {
                  patch(addFieldToShelf(view, field, "rows"));
                  setDragField(null);
                  setDragOverShelf(null);
                }}
                onRemove={(id) =>
                  patch({
                    rows: view.rows.filter((r) => r.field !== id),
                  })
                }
                onClear={() => patch({ rows: [] })}
                clearLabel={t("analyticsClear")}
              />
              <DropShelf
                shelf="columns"
                title={t("analyticsColumns")}
                hint={t("analyticsDragHint")}
                active={dragOverShelf === "columns"}
                dragging={!!dragField}
                pills={view.columns.map((c) => ({
                  id: c.field,
                  label: fieldLabel(c.field, t),
                }))}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverShelf("columns");
                }}
                onDragLeave={() => setDragOverShelf(null)}
                onDrop={(field) => {
                  patch(addFieldToShelf(view, field, "columns"));
                  setDragField(null);
                  setDragOverShelf(null);
                }}
                onRemove={(id) => {
                  const nextColumns = view.columns.filter(
                    (c) => c.field !== id,
                  );
                  patch({
                    columns: nextColumns,
                    render: {
                      ...view.render,
                      type:
                        nextColumns.length === 0 &&
                        isDualAxisRender(view.render.type)
                          ? "column"
                          : view.render.type,
                    },
                  });
                }}
                onClear={() =>
                  patch({
                    columns: [],
                    render: {
                      ...view.render,
                      type: isDualAxisRender(view.render.type)
                        ? "column"
                        : view.render.type,
                    },
                  })
                }
                clearLabel={t("analyticsClear")}
              />
              <DropShelf
                shelf="values"
                title={t("analyticsValues")}
                hint={t("analyticsDragHint")}
                active={dragOverShelf === "values"}
                dragging={!!dragField}
                pills={[
                  {
                    id: view.values[0]?.field ?? "count",
                    label: measureLabel,
                  },
                ]}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverShelf("values");
                }}
                onDragLeave={() => setDragOverShelf(null)}
                onDrop={(field) => {
                  patch(addFieldToShelf(view, field, "values"));
                  setDragField(null);
                  setDragOverShelf(null);
                }}
                onRemove={() =>
                  patch({
                    values: [measureForField("count")],
                  })
                }
                onClear={() =>
                  patch({
                    values: [measureForField("count")],
                  })
                }
                clearLabel={t("analyticsClear")}
              />
              <DropShelf
                shelf="filters"
                title={t("analyticsFilters")}
                hint={t("analyticsFiltersComingSoon")}
                active={false}
                dragging={!!dragField}
                disabled
                pills={view.filters.map((f) => ({
                  id: f.field,
                  label: fieldLabel(f.field, t),
                }))}
                onRemove={(id) =>
                  patch({
                    filters: view.filters.filter((f) => f.field !== id),
                  })
                }
                onClear={() => patch({ filters: [] })}
                clearLabel={t("analyticsClear")}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1" />
              <span className="text-xs tabular-nums text-muted-foreground">
                {t("analyticsSubmissionCount", {
                  count: result?.meta.totalFacts ?? 0,
                })}
              </span>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="mr-1.5 h-4 w-4" />
                Excel
              </Button>
            </div>

            <div className="min-h-[320px] rounded-xl bg-white p-4 shadow-sm">
              <PivotRenderer
                view={view}
                result={result}
                loading={loading}
                onDrill={onDrill}
              />
            </div>
          </div>

          <div className="space-y-1 rounded-xl bg-white p-3 shadow-sm">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("analyticsChartType")}
            </div>
            {RENDERER_REGISTRY.filter((r) =>
              ["column", "column_stacked", "column_grouped", "table"].includes(
                r.id,
              ),
            ).map((r) => {
              const Icon = CHART_TYPE_ICONS[r.id];
              return (
                <Button
                  key={r.id}
                  size="sm"
                  variant={view.render.type === r.id ? "default" : "ghost"}
                  className="h-8 w-full justify-start gap-2 text-xs"
                  onClick={() =>
                    patch({ render: { ...view.render, type: r.id } })
                  }
                >
                  {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
                  {r.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      <PresetDialog
        open={showPresets}
        onOpenChange={setShowPresets}
        views={views.filter((v) => v.is_preset)}
        onSelect={openView}
        title={t("analyticsTemplatesTitle")}
        description={t("analyticsTemplatesHint")}
      />

      <Dialog open={drillOpen || !!drill} onOpenChange={(o) => { if (!o) { setDrill(null); setDrillOpen(false); } }}>
        <DialogContent className="flex max-h-[90vh] w-screen flex-col gap-0 overflow-hidden rounded-2xl bg-white p-0 sm:max-w-3xl">
          <DialogHeader className="shrink-0 border-b border-border bg-white px-6 py-4 pr-12 text-left">
            <DialogTitle>{t("analyticsDrillTitle")}</DialogTitle>
            <DialogDescription>
              {drill && drill.total > drill.rows.length
                ? t("analyticsDrillShowing", {
                    shown: drill.rows.length,
                    total: drill.total,
                  })
                : t("analyticsDrillCount", { count: drill?.total ?? 0 })}
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-4">
            <DataTable
              columns={drillColumns}
              data={drill?.rows ?? []}
              maxBodyHeight="50vh"
              noDataPlaceholder={t("analyticsDrillEmpty")}
            />
          </div>
          {drill && drill.total > DRILL_PAGE_SIZE ? (
            <div className="flex shrink-0 items-center justify-between border-t border-border bg-white px-6 py-3">
              <Button
                variant="outline"
                size="sm"
                disabled={drill.page <= 1}
                onClick={() => void loadDrill(drill.dims, drill.page - 1)}
              >
                {tCommon("previous")}
              </Button>
              <span className="text-xs text-muted-foreground">
                {t("analyticsDrillPage", {
                  page: drill.page,
                  pages: Math.ceil(drill.total / DRILL_PAGE_SIZE),
                })}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={drill.page * DRILL_PAGE_SIZE >= drill.total}
                onClick={() => void loadDrill(drill.dims, drill.page + 1)}
              >
                {tCommon("next")}
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConfigChip({
  children,
  options,
  value,
  onSelect,
  onRemove,
  variant = "default",
}: {
  children: React.ReactNode;
  options?: Array<{ value: string; label: string }>;
  value?: string;
  onSelect?: (value: string) => void;
  onRemove?: () => void;
  variant?: "default" | "ghost";
}) {
  const interactive = Boolean(options?.length && onSelect);

  const chipClass =
    variant === "ghost"
      ? "inline-flex items-center gap-1 rounded-md border border-dashed border-border bg-transparent px-2 py-0.5 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary"
      : "inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary";

  if (!interactive) {
    return (
      <span className={chipClass}>
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-0.5 rounded-sm p-0.5 hover:bg-primary/15"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(chipClass, "cursor-pointer outline-none")}
        >
          {children}
          <ChevronDown className="h-3 w-3 opacity-70" />
          {onRemove && (
            <span
              role="button"
              tabIndex={0}
              className="rounded-sm p-0.5 hover:bg-primary/15"
              aria-label="Remove"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }
              }}
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px] bg-white">
        <DropdownMenuRadioGroup value={value} onValueChange={onSelect}>
          {options!.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropShelf({
  title,
  hint,
  pills,
  active,
  dragging,
  disabled = false,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onClear,
  clearLabel,
}: {
  shelf: ShelfKey;
  title: string;
  hint: string;
  pills: Array<{ id: string; label: string }>;
  active: boolean;
  dragging: boolean;
  disabled?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (field: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  clearLabel: string;
}) {
  return (
    <div
      onDragOver={disabled ? undefined : onDragOver}
      onDragLeave={disabled ? undefined : onDragLeave}
      onDrop={
        disabled
          ? undefined
          : (e) => {
              e.preventDefault();
              const field =
                e.dataTransfer.getData(DRAG_MIME) ||
                e.dataTransfer.getData("text/plain");
              if (field) onDrop?.(field);
            }
      }
      className={
        disabled
          ? "min-h-[72px] rounded-xl border border-dashed border-border bg-muted/30 p-3 opacity-70"
          : active
            ? "min-h-[72px] rounded-xl border border-dashed border-primary bg-primary/10 p-3"
            : dragging
              ? "min-h-[72px] rounded-xl border border-dashed border-primary/40 bg-primary-background/60 p-3"
              : "min-h-[72px] rounded-xl border border-dashed border-border bg-muted/60 p-3"
      }
    >
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
        {pills.length > 0 && (
          <button
            type="button"
            className="normal-case text-xs font-medium text-primary"
            onClick={onClear}
          >
            {clearLabel}
          </button>
        )}
      </div>
      {pills.length === 0 ? (
        <div className="text-sm text-muted-foreground">{hint}</div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {pills.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
            >
              {p.label}
              <button
                type="button"
                className="rounded-sm p-0.5 hover:bg-primary/15"
                aria-label="Remove"
                onClick={() => onRemove(p.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PresetDialog({
  open,
  onOpenChange,
  views,
  onSelect,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  views: AnalyticsViewRecord[];
  onSelect: (v: AnalyticsViewRecord) => void;
  title: string;
  description: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto p-6 sm:grid-cols-2">
          {views.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="rounded-xl border border-border bg-white p-4 text-left transition hover:border-primary hover:shadow-sm"
            >
              <div className="font-semibold">{p.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {SOURCE_LABEL[p.config.source.scoreSource]}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetaBadges({
  result,
  sourceLabel,
  t,
}: {
  result: ReturnType<typeof usePivotQuery>["data"];
  sourceLabel: string;
  t: ReturnType<typeof useTranslations<"dashboard">>;
}) {
  if (!result) return null;
  const backfilled = result.meta.orgSnapshotCoverage.backfilledCurrent > 0;

  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant="outline"
        className="border-primary/20 bg-primary-background text-primary"
      >
        {t("analyticsSourceBadge")}: {sourceLabel}
      </Badge>
      {result.meta.excludedIncomplete > 0 && (
        <Badge variant="outline">
          {t("analyticsIncompleteBadge", {
            count: result.meta.excludedIncomplete,
          })}
        </Badge>
      )}
      {result.meta.suppressedCells > 0 && (
        <Badge variant="outline">
          {t("analyticsSuppressedBadge", {
            count: result.meta.suppressedCells,
          })}
        </Badge>
      )}
      {backfilled && (
        <Badge
          variant="outline"
          title={t("analyticsBackfillHint")}
        >
          {t("analyticsBackfillBadge")}
        </Badge>
      )}
      {result.meta.warnings?.map((w) => (
        <Badge key={w} variant="destructive">
          {w}
        </Badge>
      ))}
    </div>
  );
}

function fieldLabel(
  field: string | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any) => string,
): string {
  switch (field) {
    case "score.grade":
      return "Grade";
    case "org.department":
      return t("analyticsDivision");
    case "org.job_level":
      return t("analyticsJobLevel");
    case "period":
      return t("analyticsPeriod");
    case "count":
      return t("analyticsHeadcount");
    case "score.raw":
      return t("analyticsAvgScore");
    default:
      return field ?? "—";
  }
}
