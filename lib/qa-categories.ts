export const QA_CATEGORIES = [
  "Experience",
  "Projects",
  "Skills",
  "Education",
  "Working style",
] as const;

export type QACategory = (typeof QA_CATEGORIES)[number];
