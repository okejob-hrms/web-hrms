"use client";

import { useEffect, useRef, useState } from "react";
import type { PivotResult, SavedView } from "@hrms/assessment-analytics";
import { queryPivot } from "@/services/assessment-analytics";

export function usePivotQuery(view: SavedView | null, enabled = true) {
  const [data, setData] = useState<PivotResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !view?.source?.formId || !view.source.scoreSource) {
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setError(null);
      try {
        const sanitized: SavedView = {
          ...view,
          filters: (view.filters ?? []).filter(
            (f) => Array.isArray(f.values) && f.values.length > 0,
          ),
        };
        const result = await queryPivot(sanitized);
        if (!ac.signal.aborted) setData(result);
      } catch (e) {
        if (!ac.signal.aborted) {
          setError(e instanceof Error ? e.message : "Query failed");
          setData(null);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [view, enabled]);

  return { data, error, loading };
}
