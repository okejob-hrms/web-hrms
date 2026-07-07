import {
  IAssessmentData,
  IAssessmentGroup,
} from "@/services/employees/self-assessment/types";

export function formatScoreValue(value?: number): string {
  if (value === undefined || value === null) {
    return "0";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function formatCategoryScore(
  score?: number,
  maxScore?: number,
): string {
  return `${formatScoreValue(score)} / ${formatScoreValue(maxScore)}`;
}

export function formatTotalScore(data?: IAssessmentData): string {
  return formatCategoryScore(data?.total_score, data?.max_total_score);
}

export function formatCategoryRating(group: IAssessmentGroup): string {
  return formatCategoryScore(group.rating_score, group.rating_max ?? 5);
}

export function formatWeightedContribution(group: IAssessmentGroup): string {
  return formatCategoryScore(group.score, group.max_score);
}

export function formatWeightedContributionHint(
  group: IAssessmentGroup,
): string | null {
  if (group.group_weight === undefined || group.group_weight === null) {
    return null;
  }

  const weight = Number.isInteger(group.group_weight)
    ? String(group.group_weight)
    : group.group_weight.toFixed(0);

  return `${weight}% of final score`;
}

export const ASSESSMENT_RESULT_HELPER_TEXT =
  "Questions use a 1–5 scale. Category rating reflects average performance on that scale. Weighted contribution shows how each category counts toward the final score out of 5.";
