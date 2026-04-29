import { ApiPagination } from "@/lib/types";
import { IBusinessTripResponse } from "@/services/business-trips/types";

export interface IEssBusinessTripListResponse {
  status: string;
  message: string;
  data: IBusinessTripResponse[];
  pagination: ApiPagination;
}

export interface IEssBusinessTripDetailResponse {
  status: string;
  message: string;
  data: IBusinessTripResponse;
}

export interface IEssBusinessTripCreateRequest {
  start_date: string;
  end_date: string;
  destination: string;
  reason: string;
}
