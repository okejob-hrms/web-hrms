import {
  IAssessmentData,
  IAssessmentField,
  IAssessmentGroup,
} from "@/services/employees/self-assessment/types";
import { IFormGroup } from "@/services/form/types";

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
  "Each question uses the scale shown on that item (for example 1–5). Category rating converts answers so the lowest option counts as 0 and the highest as 5, then averages them on that 0–5 scale. Weighted contribution applies each category’s weight toward the total score out of 5.";

export const CATEGORY_RATING_COLUMN_TOOLTIP =
  "Average performance for this category on a 0–5 scale. Each answer is converted from its own scale so the minimum option = 0 and the maximum = 5, then combined using each question’s weight.";

export const WEIGHTED_CONTRIBUTION_COLUMN_TOOLTIP =
  "How much this category adds to the final score out of 5. Calculated from the category rating multiplied by the category weight (shown below each value).";

export const TOTAL_SCORE_TOOLTIP_LABEL = "How the total score is calculated";

export interface ScoreTooltipFormField {
  id: number;
  label: string;
  type: string;
  options?: { min: number; max: number } | string[];
  metadata?: { score_weight?: number } | null;
  field_group_id: number;
}

function getRangeOptions(
  options: ScoreTooltipFormField["options"],
): { min: number; max: number } | null {
  if (!options || Array.isArray(options)) {
    return null;
  }

  if (typeof options.min === "number" && typeof options.max === "number") {
    return { min: options.min, max: options.max };
  }

  return null;
}

function getEffectiveRatingPoints(
  value: number,
  min: number,
  max: number,
): number {
  const range = max - min;
  if (range === 0) {
    return 0;
  }

  return ((value - min) / range) * 5;
}

export function indexFormFieldsById(
  formGroups?: IFormGroup[],
): Map<number, ScoreTooltipFormField> {
  const map = new Map<number, ScoreTooltipFormField>();

  if (!formGroups) {
    return map;
  }

  for (const group of formGroups) {
    const groupId = Number(group.id);

    for (const field of group.fields ?? []) {
      map.set(field.id, {
        id: field.id,
        label: field.label,
        type: field.type,
        options: field.options,
        metadata: field.metadata,
        field_group_id: groupId,
      });
    }
  }

  return map;
}

export function buildCategoryRatingTooltip(
  group: IAssessmentGroup,
  fields: IAssessmentField[] | undefined,
  formFieldsById: Map<number, ScoreTooltipFormField>,
): string {
  const rangeFields = (fields ?? []).filter((field) => {
    if (field.field_group_id !== group.field_group_id) {
      return false;
    }

    const formField = formFieldsById.get(field.field_id);
    return formField?.type === "range";
  });

  if (rangeFields.length === 0) {
    return `${group.name}\nNo scored questions in this category.`;
  }

  const lines: string[] = [`${group.name} — Category Rating`, ""];
  let sumScore = 0;
  let sumMaxScore = 0;

  for (const assessmentField of rangeFields) {
    const formField = formFieldsById.get(assessmentField.field_id);
    const weight = Number(formField?.metadata?.score_weight ?? 0);
    const rangeOptions = getRangeOptions(formField?.options);
    const value = Number(assessmentField.value);

    sumScore += assessmentField.score;
    sumMaxScore += weight / 100;

    const label = formField?.label ?? `Question ${assessmentField.field_id}`;
    let effective = 0;

    if (rangeOptions && !Number.isNaN(value)) {
      effective = getEffectiveRatingPoints(
        value,
        rangeOptions.min,
        rangeOptions.max,
      );
    } else if (weight > 0) {
      effective = (assessmentField.score / (weight / 100)) * 5;
    }

    const scalePart = rangeOptions
      ? `scale ${rangeOptions.min}–${rangeOptions.max}`
      : "scored question";
    const weightPart = weight > 0 ? `, ${weight}%` : "";

    lines.push(
      `${label}: ${assessmentField.value} (${scalePart}${weightPart}) → ${formatScoreValue(effective)} pts`,
    );
  }

  lines.push("");

  if (sumMaxScore > 0) {
    const rating =
      group.rating_score ?? (sumScore / sumMaxScore) * 5;

    lines.push(
      `Weighted average: (${formatScoreValue(sumScore)} ÷ ${formatScoreValue(sumMaxScore)}) × 5 = ${formatScoreValue(rating)} / 5`,
    );
  }

  lines.push("");
  lines.push(
    "Note: The lowest option on each scale counts as 0 on this rating, not as 1.",
  );

  return lines.join("\n");
}

export function buildWeightedContributionTooltip(
  group: IAssessmentGroup,
): string {
  const weight = group.group_weight ?? 0;
  const rating = group.rating_score ?? 0;

  return [
    `${group.name} — Weighted Contribution`,
    "",
    `Category rating: ${formatScoreValue(rating)} / 5`,
    `Category weight: ${formatScoreValue(weight)}%`,
    "",
    "Contribution = category rating × category weight",
    `${formatScoreValue(rating)} × ${formatScoreValue(weight)}% = ${formatScoreValue(group.score)} / ${formatScoreValue(group.max_score)}`,
  ].join("\n");
}

export function buildTotalScoreTooltip(data?: IAssessmentData): string {
  if (!data?.groups?.length) {
    return "Total score from all category weighted contributions.";
  }

  const lines = ["Total Score", ""];

  for (const group of data.groups) {
    lines.push(`${group.name}: ${formatScoreValue(group.score)}`);
  }

  lines.push("—");
  lines.push(
    `${data.groups.map((group) => formatScoreValue(group.score)).join(" + ")} = ${formatTotalScore(data)}`,
  );

  return lines.join("\n");
}
