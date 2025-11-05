export interface AllowanceTypes {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  effective_date: string;
  expire_date: string;
  job_levels:
    | {
        id: number;
        name: string;
        amount: string;
      }[]
    | null;
}
