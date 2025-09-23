import { api } from "@/lib/api";
import { PaginatedResponse } from "@/lib/types";
import { Attendance } from "./types";

export const getAttendance = async (): Promise<PaginatedResponse<Attendance>> => {
  const response = await api.get(`employee/attendances`);
  return response.json<PaginatedResponse<Attendance>>();
};