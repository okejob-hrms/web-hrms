export interface IOKRResponse {
  id: number;
  period: string;
  period_year: number;
  name: string;
  start_date: string;
  end_date: string;
  status: number;
  status_label: string;
  tenant_id: number;
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
}

export interface IOKRCycle {
  period_year: number;
  page: number;
  per_page: number;
  status: string;
}

export interface IOKRCycleRequest {
  end_date: string;
  period: string;
  period_year: string;
  start_date: string;
}

export interface IOKRObjectiveRequest {
  okr_cycle_id: number;
  title: string;
  description: string;
}
