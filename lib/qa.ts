import { promises as fs } from "node:fs";
import path from "node:path";
import { QA_CATEGORIES } from "@/lib/qa-categories";
import type { QACategory } from "@/lib/qa-categories";

export type QAEntry = {
  id: string;
  question: string;
  answer: string;
  category: QACategory;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
};

export type QAInput = {
  question: string;
  answer: string;
  category: QACategory;
  keywords: string[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "qa.json");

export async function getAllQA(): Promise<QAEntry[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getQAById(id: string): Promise<QAEntry | null> {
  const entries = await getAllQA();
  return entries.find((entry) => entry.id === id) ?? null;
}

export async function addQA(input: QAInput): Promise<QAEntry> {
  const entry: QAEntry = {
    id: crypto.randomUUID(),
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category,
    keywords: input.keywords,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const entries = await getAllQA();
  entries.push(entry);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");

  return entry;
}

export async function updateQA(
  id: string,
  input: QAInput
): Promise<QAEntry | null> {
  const entries = await getAllQA();
  const index = entries.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return null;
  }

  const updated: QAEntry = {
    ...entries[index],
    question: input.question.trim(),
    answer: input.answer.trim(),
    category: input.category,
    keywords: input.keywords,
    updatedAt: new Date().toISOString(),
  };

  entries[index] = updated;

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), "utf8");

  return updated;
}

export async function deleteQA(id: string): Promise<boolean> {
  const entries = await getAllQA();
  const remaining = entries.filter((entry) => entry.id !== id);

  if (remaining.length === entries.length) {
    return false;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(remaining, null, 2), "utf8");

  return true;
}

export function validateQAInput(body: unknown): {
  input: QAInput | null;
  errors: Record<string, string>;
} {
  const source = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const question =
    typeof source.question === "string" ? source.question.trim() : "";
  const answer = typeof source.answer === "string" ? source.answer.trim() : "";
  const category =
    typeof source.category === "string" ? source.category.trim() : "";

  if (!question) {
    errors.question = "Question is required.";
  }
  if (!answer) {
    errors.answer = "Answer is required.";
  }
  if (!QA_CATEGORIES.includes(category as QACategory)) {
    errors.category = `Category must be one of: ${QA_CATEGORIES.join(", ")}.`;
  }

  let keywords: string[] = [];
  if (source.keywords === undefined || source.keywords === null) {
    keywords = [];
  } else if (Array.isArray(source.keywords)) {
    keywords = source.keywords
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  } else {
    errors.keywords = "Keywords must be a list of strings.";
  }

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  return {
    input: {
      question,
      answer,
      category: category as QACategory,
      keywords,
    },
    errors,
  };
}
