export const INDUSTRIES = [
  "Banking",
  "Tech",
  "Retail",
  "Consulting",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export type ExperienceDates = {
  startDate: string;
  endDate: string | null;
};

export function formatExperienceDates(entry: ExperienceDates): string {
  if (!entry.startDate) {
    return "No dates yet";
  }
  const [startYear, startMonth] = entry.startDate.split("-");
  const start = `${MONTHS[Number(startMonth) - 1]} ${startYear}`;
  if (!entry.endDate) {
    return `${start} – Present`;
  }
  const [endYear, endMonth] = entry.endDate.split("-");
  return `${start} – ${MONTHS[Number(endMonth) - 1]} ${endYear}`;
}
