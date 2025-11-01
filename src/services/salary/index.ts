 
import { api } from "@/lib/api";
import { RequestAllowance, ResponseAllowance } from "./types";

export const getAllowance = async (): Promise<ResponseAllowance> => {
  const response = await api.get("allowance-types");
  return response.json();
};

export const getAllowanceById = async (id: number): Promise<ResponseAllowance> => {
  const response = await api.get(`allowance-types/${id}`);
  return response.json<ResponseAllowance>();
};

export const postAllowance = async (
  payload: RequestAllowance,
): Promise<ResponseAllowance> => {
  return api
    .post(`allowance-types`, {
      json: payload,
    })
    .json<ResponseAllowance>();
};

export const putAllowance = async (
  id: number,
  payload: RequestAllowance,
): Promise<ResponseAllowance> => {
  return api
    .put(`allowance-types/${id}`, {
      json: payload,
    })
    .json<ResponseAllowance>();
};

export const removeAllowance = async (
  id: number,
): Promise<ResponseAllowance> => {
  return api
    .delete(`allowance-types/${id}`, {
      json: {},
    })
    .json<ResponseAllowance>();
};