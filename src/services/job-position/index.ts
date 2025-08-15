import { api } from "@/lib/api";
import { IPositionForm } from "./types";

export const postJobPosition = async (payload: IPositionForm) => {
  const response = await api.post(
    "/api/v1/job-positions",
    JSON.stringify(payload),
  );
  return response;
};

export const getJobPosition = async () => {
  const response = await api.get(
    "/api/v1/job-positions",
    // JSON.stringify(payload),
  );
  return response;
};
