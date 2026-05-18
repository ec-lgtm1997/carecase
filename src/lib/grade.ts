// Motivating linear grading scale (German Noten).
// Optimised so that strong-but-not-perfect performance still feels rewarding.
export type Grade = "1,0" | "1,3" | "1,7" | "2,0" | "2,3" | "2,7" | "3,0" | "3,3" | "3,7" | "4,0" | "5,0";

const SCALE: { min: number; grade: Grade; label: string }[] = [
  { min: 88, grade: "1,0", label: "Sehr gut" },
  { min: 82, grade: "1,3", label: "Sehr gut −" },
  { min: 76, grade: "1,7", label: "Gut +" },
  { min: 70, grade: "2,0", label: "Gut" },
  { min: 64, grade: "2,3", label: "Gut −" },
  { min: 58, grade: "2,7", label: "Befriedigend +" },
  { min: 52, grade: "3,0", label: "Befriedigend" },
  { min: 46, grade: "3,3", label: "Befriedigend −" },
  { min: 40, grade: "3,7", label: "Ausreichend +" },
  { min: 33, grade: "4,0", label: "Ausreichend" },
  { min: 0,  grade: "5,0", label: "Nicht bestanden" },
];

export function gradeFromPercent(percent: number) {
  for (const row of SCALE) {
    if (percent >= row.min) return row;
  }
  return SCALE[SCALE.length - 1];
}
