export const GRADE_COLORS: Record<string, string> = {
  A: "#1c6b93",
  B: "#6ba3c4",
  C: "#d8d0c2",
  D: "#e3aa5c",
  E: "#c47f2c",
  "Sangat Baik": "#1c6b93",
  Baik: "#6ba3c4",
  Cukup: "#d8d0c2",
  Kurang: "#c47f2c",
};

export function gradeColor(label: string, i = 0): string {
  if (GRADE_COLORS[label]) return GRADE_COLORS[label];
  if (label === "Belum Dinilai" || label.includes("Belum")) return "#b9b3aa";
  const ramp = ["#1c6b93", "#6ba3c4", "#d8d0c2", "#e3aa5c", "#c47f2c", "#8a8680"];
  return ramp[i % ramp.length];
}
