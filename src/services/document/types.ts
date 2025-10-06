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
  url: string;
}
