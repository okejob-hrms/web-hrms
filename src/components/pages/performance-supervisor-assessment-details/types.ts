import { IFormGroup } from "@/services/form/types";
import { ISupervisorAssessmentFinalScore } from "@/services/performances/supervisor-assessment/types";

export interface ScoreItem {
  id: string;
  title: string;
  description: string;
  percentage: number;
  score: number;
  maxScore: number;
  subTotal: number;
}

export interface Notes {
  strengths: string;
  weakness: string;
  supervisorNotes: string;
}

export interface AssessmentSummary {
  kategori: string;
  score: number;
  maxScore: number;
}

export interface SupervisorAssessmentResultProps {
  id: number;
}

export interface ISummaryRow {
  id: string;
  category: string;
  score: number;
  maxScore?: number;
  bgColor?: "default" | "yellow" | "blue";
  textColor?: "default" | "red" | "blue";
}

export interface AssessmentSummaryTableProps {
  data: ISupervisorAssessmentFinalScore;
}
