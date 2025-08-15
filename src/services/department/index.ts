import { api } from "@/lib/api";
import { IDepartmentForm } from "./types";

export const postDepartment = async (payload: IDepartmentForm) => {
  const response = await api.post(
    "/api/v1/departments",
    JSON.stringify(payload),
  );
  return response;
};

export const getDepartment = async () => {
  const response = await api.get(
    "/api/v1/departments",
    // JSON.stringify(payload),
  );
  return response;
};
