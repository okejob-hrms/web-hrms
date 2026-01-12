export interface IPenaltyResponse {
  id: number;
  user_id: number;
  point: number;
  name: string;
  description: string;
  valid_until: string | null;
  author_id: number;
  created_at: string;
  updated_at: string;
}
