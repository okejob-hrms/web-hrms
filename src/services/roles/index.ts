import { api } from "@/lib/api";
import { RolesApiResponse } from "./types";

export const getRoles = async (): Promise<RolesApiResponse> => {
  const response = await api.get<RolesApiResponse>(
    "roles",
    // JSON.stringify(payload),
  );
  return response.json();
};
