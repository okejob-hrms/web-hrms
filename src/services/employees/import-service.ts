/* eslint-disable @typescript-eslint/no-explicit-any */
import { api, apiUpload } from "@/lib/api";

export interface IImportReportError {
  row?: number;
  message?: string;
}

export interface IPaginatedErrors {
  current_page: number;
  data: IImportReportError[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface IImportReportResponse {
  status: string;
  message: string;
  data: {
    import_id: string;
    status: string;
    total_rows: number;
    success_rows: number;
    failed_rows: number;
    errors: IPaginatedErrors;
  };
}

export interface IImportProcessResponse {
  status: string;
  message: string;
  data: {
    import_id: string;
    status: string;
  };
}

export const downloadImportTemplate = async () => {
  // Use api or apiEmployee depending on which prefixUrl matches 'employees/...'
  return api.get("employees/download/template", {
    timeout: 60000, // Override default 10s timeout since API takes ~20s
    headers: {
      // This override prevents the 'application/json' default in your interceptor
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }).blob();
};

export const processImport = async (file: File): Promise<IImportProcessResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload.post("employees/imports/process", { body: formData }).json();
};

export const getImportReport = async (importId: string, page: number = 1): Promise<IImportReportResponse> => {
  return api.get(`employees/imports/${importId}/report`, { searchParams: { page } }).json();
};
