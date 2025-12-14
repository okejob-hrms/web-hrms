import { api } from "@/lib/api";
import { HolidayResponse, HolidayRequest, HolidayList } from "./types";
// import { PaginationState } from "@tanstack/react-table";

export const getHoliday = async (): Promise<HolidayList[]> => {
  const response = await api.get(`setting/holiday-calendars`);
  return response.json<HolidayList[]>();
};

export const postHoliday = async (
  payload: HolidayRequest,
): Promise<HolidayResponse> => {
  return api
    .post(`setting/holiday-calendars`, {
      json: payload,
    })
    .json<HolidayResponse>();
};

export const putHoliday = async (
  id: number,
  payload: HolidayRequest,
): Promise<HolidayResponse> => {
  return api
    .put(`setting/holiday-calendars/${id}`, {
      json: payload,
    })
    .json<HolidayResponse>();
};

export const removeHoliday = async (id: number): Promise<HolidayResponse> => {
  return api
    .delete(`setting/holiday-calendars/${id}`, {
      json: {},
    })
    .json<HolidayResponse>();
};
