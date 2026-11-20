import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { INDUSTRIES } from "@/lib/experience-shared";
import type { Industry } from "@/lib/experience-shared";

export {
  INDUSTRIES,
  formatExperienceDates,
} from "@/lib/experience-shared";
export type { Industry } from "@/lib/experience-shared";

export type Experience = {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  industry: Industry;
  highlights: string[];
  skills: string[];
};

export type ExperienceInput = {
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string | null;
  industry: Industry;
  highlights: string[];
  skills: string[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "experience.json");

export async function getAllExperience(): Promise<Experience[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getExperienceById(id: string): Promise<Experience | null> {
  const entries = await getAllExperience();
  return entries.find((entry) => entry.id === id) ?? null;
}

function isDated(entry: Experience): boolean {
  return entry.startDate !== "";
}

function isCurrent(entry: Experience): boolean {
  return entry.endDate === null;
}

function byStartDesc(a: Experience, b: Experience): number {
  return b.startDate.localeCompare(a.startDate);
}

export function sortExperience(entries: Experience[]): Experience[] {
  return [...entries].sort((a, b) => {
    if (isDated(a) !== isDated(b)) {
      return isDated(a) ? -1 : 1;
    }
    if (!isDated(a)) {
      return 0;
    }
    if (isCurrent(a) !== isCurrent(b)) {
      return isCurrent(a) ? -1 : 1;
    }
    return byStartDesc(a, b);
  });
}

export async function addExperience(
  input: ExperienceInput
): Promise<Experience> {
  const entries = await getAllExperience();

  const entry: Experience = {
    id: randomUUID(),
    company: input.company.trim(),
    title: input.title.trim(),
    location: input.location.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    industry: input.industry,
    highlights: input.highlights,
    skills: input.skills,
  };

  entries.push(entry);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");

  return entry;
}

export async function updateExperience(
  id: string,
  input: ExperienceInput
): Promise<Experience | null> {
  const entries = await getAllExperience();
  const index = entries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return null;
  }

  const updated: Experience = {
    ...entries[index],
    company: input.company.trim(),
    title: input.title.trim(),
    location: input.location.trim(),
    startDate: input.startDate,
    endDate: input.endDate,
    industry: input.industry,
    highlights: input.highlights,
    skills: input.skills,
  };

  entries[index] = updated;

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");

  return updated;
}

export async function deleteExperience(id: string): Promise<boolean> {
  const entries = await getAllExperience();
  const remaining = entries.filter((entry) => entry.id !== id);

  if (remaining.length === entries.length) {
    return false;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(remaining, null, 2), "utf8");

  return true;
}

const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function validateExperienceInput(body: unknown): {
  input: ExperienceInput | null;
  errors: Record<string, string>;
} {
  const source = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const company = typeof source.company === "string" ? source.company.trim() : "";
  const title = typeof source.title === "string" ? source.title.trim() : "";
  const location =
    typeof source.location === "string" ? source.location.trim() : "";

  if (!company) {
    errors.company = "Company is required.";
  }
  if (!title) {
    errors.title = "Title is required.";
  }

  const industry =
    typeof source.industry === "string" ? source.industry.trim() : "";
  if (!INDUSTRIES.includes(industry as Industry)) {
    errors.industry = `Industry must be one of: ${INDUSTRIES.join(", ")}.`;
  }

  const startDateValue =
    typeof source.startDate === "string" ? source.startDate.trim() : "";
  if (startDateValue && !DATE_PATTERN.test(startDateValue)) {
    errors.startDate = "Start date must be in YYYY-MM format.";
  }

  let endDateValue: string | null = null;
  const rawEndDate = source.endDate;
  if (typeof rawEndDate === "string" && rawEndDate.trim()) {
    if (!DATE_PATTERN.test(rawEndDate.trim())) {
      errors.endDate = "End date must be in YYYY-MM format (leave empty for current roles).";
    } else {
      endDateValue = rawEndDate.trim();
    }
  }

  if (
    !errors.startDate &&
    !errors.endDate &&
    startDateValue &&
    endDateValue &&
    endDateValue < startDateValue
  ) {
    errors.endDate = "End date can't be before the start date.";
  }

  const parseOptionalList = (value: unknown, label: string): string[] | null => {
    if (value === undefined) {
      return [];
    }
    if (!Array.isArray(value)) {
      errors[label] = label === "highlights"
        ? "Highlights must be a list."
        : "Skills must be a list.";
      return null;
    }
    const cleaned = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return cleaned;
  };

  const highlights = parseOptionalList(source.highlights, "highlights");
  const skills = parseOptionalList(source.skills, "skills");

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  return {
    input: {
      company,
      title,
      location,
      startDate: startDateValue,
      endDate: endDateValue,
      industry: industry as Industry,
      highlights: highlights ?? [],
      skills: skills ?? [],
    },
    errors,
  };
}
