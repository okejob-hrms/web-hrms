export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface RolesApiResponse {
  current_page: number;
  current_page_url: string;
  data: Role[];
  first_page_url: string;
  from: number;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
}
