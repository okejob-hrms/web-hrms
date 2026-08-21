"use client";

import type { SavedView, ShelfField, MeasureField, FilterClause } from "@hrms/assessment-analytics";
import { useCallback, useReducer } from "react";

type HistoryState = {
  present: SavedView;
  past: SavedView[];
  future: SavedView[];
};

type Action =
  | { type: "replace"; view: SavedView }
  | { type: "patch"; patch: Partial<SavedView> }
  | { type: "setRows"; rows: ShelfField[] }
  | { type: "setColumns"; columns: ShelfField[] }
  | { type: "setValues"; values: MeasureField[] }
  | { type: "setFilters"; filters: FilterClause[] }
  | { type: "undo" }
  | { type: "redo" };

function push(state: HistoryState, next: SavedView): HistoryState {
  return {
    present: next,
    past: [...state.past, state.present].slice(-40),
    future: [],
  };
}

function reducer(state: HistoryState, action: Action): HistoryState {
  switch (action.type) {
    case "replace":
      return { present: action.view, past: [], future: [] };
    case "patch":
      return push(state, { ...state.present, ...action.patch, version: 1 });
    case "setRows":
      return push(state, { ...state.present, rows: action.rows });
    case "setColumns":
      return push(state, { ...state.present, columns: action.columns });
    case "setValues":
      return push(state, { ...state.present, values: action.values });
    case "setFilters":
      return push(state, { ...state.present, filters: action.filters });
    case "undo": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      return {
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return {
        present: next,
        past: [...state.past, state.present],
        future: rest,
      };
    }
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

export function blankSavedView(partial?: Partial<SavedView>): SavedView {
  return {
    version: 1,
    id: crypto.randomUUID(),
    name: "Analisa Baru",
    source: {
      formId: "",
      definitionHash: "",
      scoreSource: "supervisor_final",
      periodKeys: [],
    },
    rows: [{ field: "score.grade" }],
    columns: [],
    values: [
      {
        field: "count",
        agg: "count",
        showAs: "pct_of_grand_total",
        format: { decimals: 1, suffix: "%" },
      },
    ],
    filters: [],
    options: {
      includeIncomplete: true,
      suppression: { enabled: false, minN: 5 },
      totals: { rows: false, columns: false },
    },
    render: { type: "column", overlays: [] },
    ...partial,
  };
}

export function useSavedView(initial?: SavedView) {
  const [state, dispatch] = useReducer(reducer, {
    present: initial ?? blankSavedView(),
    past: [],
    future: [],
  });

  const replace = useCallback((view: SavedView) => dispatch({ type: "replace", view }), []);
  const patch = useCallback((p: Partial<SavedView>) => dispatch({ type: "patch", patch: p }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);

  return {
    view: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    replace,
    patch,
    undo,
    redo,
    setRows: (rows: ShelfField[]) => dispatch({ type: "setRows", rows }),
    setColumns: (columns: ShelfField[]) => dispatch({ type: "setColumns", columns }),
    setValues: (values: MeasureField[]) => dispatch({ type: "setValues", values }),
    setFilters: (filters: FilterClause[]) => dispatch({ type: "setFilters", filters }),
  };
}
