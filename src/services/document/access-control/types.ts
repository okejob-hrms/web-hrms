export interface IManageAccessDocumentResponse {
  access_control: {
    employee_document_id: number;
    access_level: string;
    link_enabled: boolean;
    link_token: string;
    updated_at: string;
    created_at: string;
    id: number;
  };
  shares: {
    employee_document_id: number;
    granteeable_type: string;
    granteeable_id: number;
    can_view: boolean;
    can_download: boolean;
    can_edit: boolean;
    invited_by: number;
    updated_at: string;
    created_at: string;
    id: number;
  }[];
}
