export type AssessmentCompetencyLevel = {
  id?: number;
  dimensions?: string;
  level: string | number;
  name?: string | null;
  description?: string | null;
};

export type AssessmentKeteranganResult = {
  description: string;
  levelName: string | null;
};

/**
 * Resolves display keterangan for assessment fields.
 * When a score is selected and competency_levels exist, prefer that level's
 * description/name (same behavior as mobile CompetencyRatingField).
 */
export function resolveAssessmentKeterangan(
  description: string | null | undefined,
  competencyLevels: AssessmentCompetencyLevel[] | null | undefined,
  selectedRating?: string | number | null,
): AssessmentKeteranganResult {
  const baseDescription = description?.trim() || "";
  let levelName: string | null = null;
  let resolvedDescription = baseDescription;

  if (
    selectedRating !== undefined &&
    selectedRating !== null &&
    selectedRating !== "" &&
    competencyLevels?.length
  ) {
    const matched = competencyLevels.find(
      (level) => String(level.level) === String(selectedRating),
    );

    if (matched) {
      const matchedName = matched.name?.trim();
      if (matchedName) {
        levelName = matchedName;
      }

      const matchedDescription = matched.description?.trim();
      if (matchedDescription) {
        resolvedDescription = matchedDescription;
      }
    }
  }

  return { description: resolvedDescription, levelName };
}
