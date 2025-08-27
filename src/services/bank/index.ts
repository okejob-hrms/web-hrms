import { ApiResponse } from "@/lib/types";
import { IResponseBank } from "./types";
import { api } from "@/lib/api";

export const getBankList = (): Promise<ApiResponse<IResponseBank[]>> => {
  const response = api.get<ApiResponse<IResponseBank[]>>("banks");
  return response.json();
};
