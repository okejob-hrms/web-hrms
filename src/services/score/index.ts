import { api } from "@/lib/api";
import { ScoreRequest, ScoreResponse } from "./types";
import { PaginationState } from "@tanstack/react-table";

export const getScore = async (
  pagination?: PaginationState,
  work_value?: number,
  score_source: "supervisor_final" | "self" = "supervisor_final",
): Promise<ScoreResponse> => {
  const searchParams: Record<string, string> = {
    score_source,
  };

  if (pagination) {
    const page = pagination.pageIndex + 1;
    const per_page = pagination.pageSize;
    searchParams.page = page.toString();
    searchParams.per_page = per_page.toString();
  }

  if (work_value !== undefined) {
    searchParams.work_value = work_value.toString();
  }

  const response = await api.get<ScoreResponse>(`setting/score-thresholds`, {
    searchParams,
  });

  return response.json();
};

export const postScore = async (
  payload: ScoreRequest,
): Promise<ScoreResponse> => {
  return api
    .post(`setting/score-thresholds`, {
      json: payload,
    })
    .json<ScoreResponse>();
};

export const putScore = async (
  id: number,
  payload: ScoreRequest,
): Promise<ScoreResponse> => {
  return api
    .put(`setting/score-thresholds/${id}`, {
      json: payload,
    })
    .json<ScoreResponse>();
};

export const removeScore = async (id: number): Promise<ScoreResponse> => {
  return api
    .delete(`setting/score-thresholds/${id}`, {
      json: {},
    })
    .json<ScoreResponse>();
};
