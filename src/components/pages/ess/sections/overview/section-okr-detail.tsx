"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getEssOkrCycle,
  getEssOkrKeyResultTracking,
  setEssOkrTrackingValues,
} from "@/services/ess/okr";
import { IOKRKeyResult, IOKRObjective } from "@/services/okr/types";

interface EssOkrDetailProps {
  cycleId: number;
}

function KeyResultTrackingPanel({ keyResult }: { keyResult: IOKRKeyResult }) {
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [values, setValues] = React.useState<Record<number, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["ess-okr-kr-tracking", keyResult.id],
    queryFn: () => getEssOkrKeyResultTracking(keyResult.id),
  });

  const trackingRows = data?.data?.tracking_table ?? [];

  React.useEffect(() => {
    const rows = data?.data?.tracking_table ?? [];
    const next: Record<number, string> = {};
    rows.forEach((row) => {
      next[row.period_id] =
        row.actual_value != null ? String(row.actual_value) : "";
    });
    setValues(next);
  }, [data?.data?.tracking_table]);

  const { mutate, isPending } = useMutation({
    mutationFn: setEssOkrTrackingValues,
    onSuccess: () => {
      toast.success(t("trackingUpdatedSuccess"));
      queryClient.invalidateQueries({
        queryKey: ["ess-okr-kr-tracking", keyResult.id],
      });
    },
    onError: () => {
      toast.error(t("trackingUpdatedFailed"));
    },
  });

  const handleSave = () => {
    const payload = trackingRows
      .map((row) => ({
        key_result_id: keyResult.id,
        tracking_period_id: row.period_id,
        actual_value: Number(values[row.period_id] ?? 0),
      }))
      .filter((row) => !Number.isNaN(row.actual_value));

    if (!payload.length) {
      toast.error(t("noTrackingValues"));
      return;
    }
    mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!trackingRows.length) {
    return (
      <p className="text-sm text-gray-500 py-2">{t("noTrackingPeriods")}</p>
    );
  }

  return (
    <div className="space-y-3 border rounded-md p-4 bg-gray-50">
      <p className="text-sm font-medium">{t("trackingPeriods")}</p>
      <div className="grid gap-3">
        {trackingRows.map((row) => (
          <div
            key={row.period_id}
            className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center"
          >
            <span className="text-sm">{row.label}</span>
            <span className="text-sm text-gray-500">
              {t("target")}: {row.target_value ?? "-"}
            </span>
            <Input
              type="number"
              value={values[row.period_id] ?? ""}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [row.period_id]: e.target.value,
                }))
              }
              placeholder={t("actualValue")}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? tCommon("processing") : t("saveTracking")}
        </Button>
      </div>
    </div>
  );
}

export const EssOkrDetail = ({ cycleId }: EssOkrDetailProps) => {
  const router = useRouter();
  const t = useTranslations("performance");
  const tCommon = useTranslations("common");
  const [expandedKr, setExpandedKr] = React.useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ess-okr-cycle", cycleId],
    queryFn: () => getEssOkrCycle(cycleId),
  });

  const cycle = data?.data;

  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !cycle) {
    return (
      <div className="px-8 py-6 text-center text-gray-500">
        {t("okrNotFound")}
      </div>
    );
  }

  const objectives = (cycle.objectives ?? []) as IOKRObjective[];

  return (
    <div className="font-sans min-h-screen flex flex-col gap-6 px-6 md:px-12 py-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {cycle.name || `${cycle.period} ${cycle.period_year}`}
          </h1>
          <p className="text-gray-500">
            {cycle.status_label} · {t("progress")}:{" "}
            {cycle.overall_progress ?? "-"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/ess/okr")}
        >
          {tCommon("back")}
        </Button>
      </div>

      {objectives.length === 0 ? (
        <p className="text-gray-500">{t("noObjectives")}</p>
      ) : (
        objectives.map((objective) => (
          <div
            key={objective.id}
            className="rounded-md bg-white border shadow-sm border-grayscale-20 p-6 space-y-4"
          >
            <div>
              <h2 className="font-semibold text-lg">{objective.title}</h2>
              {objective.description && (
                <p className="text-sm text-gray-500">{objective.description}</p>
              )}
            </div>
            {(objective.key_results ?? []).map((kr) => (
              <div key={kr.id} className="border rounded-md p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{kr.title}</p>
                    <p className="text-sm text-gray-500">
                      {kr.current_value} / {kr.target_value} · {kr.progress}%
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setExpandedKr((prev) =>
                        prev === kr.id ? null : kr.id,
                      )
                    }
                  >
                    {expandedKr === kr.id
                      ? t("hideTracking")
                      : t("updateTracking")}
                  </Button>
                </div>
                {expandedKr === kr.id && (
                  <KeyResultTrackingPanel keyResult={kr} />
                )}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};
