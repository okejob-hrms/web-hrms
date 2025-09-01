import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/lib/types";
import qs from "qs";
import { IContactReferenceResponse, IContactReferenceForm } from "./types";

interface Params {
  employee_profile_id?: number;
  payload?: IContactReferenceForm;
  search?: string;
}

export const postCreateContactReference = async (
  params: Params,
): Promise<ApiResponse<IContactReferenceResponse>> => {
  const response = await api.post<ApiResponse<IContactReferenceResponse>>(
    `employees/${params.employee_profile_id ? `${params.employee_profile_id}/` : ""}contact-references`,
    { json: params.payload },
  );
  return response.json();
};

export const getContactReferences = async (
  params: Params,
): Promise<ApiResponse<PaginatedResponse<IContactReferenceResponse>>> => {
  const response = await api.get<
    ApiResponse<PaginatedResponse<IContactReferenceResponse>>
  >(
    `employees/${params.employee_profile_id}/contact-references${params.search ? qs.stringify({ search: params.search }, { encodeValuesOnly: true }) : ""}`,
  );
  return response.json();
};
