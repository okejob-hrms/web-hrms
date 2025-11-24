/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IPerformanceCompetencyResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  levels: any[];
}

export interface IPerformanceCompetencyLevel {
  id: number;
  performance_competency_id: number;
  dimensions: string;
  level: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface IPerformanceCompetencyDetails {
  id: number;
  code: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  levels: IPerformanceCompetencyLevel[];
}

export interface IMutatePerformanceCompetency {
  code: string;
  name: string;
  description: string;
}
