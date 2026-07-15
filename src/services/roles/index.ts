import { api } from "@/lib/api";
import { RolesApiResponse } from "./types";

export const getRoles = async (): Promise<RolesApiResponse> => {
  const response = await api.get<RolesApiResponse>("roles", {
    searchParams: {
      page: "1",
      per_page: "10000",
    },
  });
  return response.json();
};
