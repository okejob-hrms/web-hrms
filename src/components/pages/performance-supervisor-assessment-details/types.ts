export interface ScoreItem {
  id: string;
  title: string;
  description: string;
  percentage: number;
  score: number;
  maxScore: number;
  subTotal: number;
}

export interface CategorySection {
  id: string;
  name: string;
  items: ScoreItem[];
  notes?: Notes;
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
  onEdit?: () => void;
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
  data: ISummaryRow[];
}
