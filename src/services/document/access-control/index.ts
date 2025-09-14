import { api } from "@/lib/api";
import { IManageAccessDocumentResponse } from "./types";

interface Params {
  employee_document_id: number;
  access_level: string;
  link_enabled: boolean;
  granteeables: {
    granteeable_type: string;
    granteeable_id: number;
  }[];
}

export const postManageAccessDocument = (
  params: Params,
): Promise<IManageAccessDocumentResponse> => {
  const response = api.post<IManageAccessDocumentResponse>(
    `documents/access-control`,
    { json: params },
  );
  return response.json();
};
