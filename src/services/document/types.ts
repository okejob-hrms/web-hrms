export interface IEmployeeDocumentResponse {
  id: number;
  employee_profile_id: number;
  type: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  disk: string;
  uploaded_by: {
    id: number;
    name: string;
  };
  uploaded_at: string;
  created_at: string;
  updated_at: string;
  url?: string | null;
  current_version?: number;
  version_count?: number;
}

export interface IEmployeeDocumentVersion {
  id: number;
  employee_document_id: number;
  version: number;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  disk: string;
  url?: string | null;
  uploaded_by: {
    id: number;
    name: string;
  };
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}
