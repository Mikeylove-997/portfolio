import { appendFile, readFile, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

const LOG_PATH = path.join(process.cwd(), "data", "assistant-log.jsonl");

export type AssistantLogEntry = {
  id: string;
  timestamp: string;
  question: string;
  mode: "ai" | "keyword";
  matched: boolean;
  sources: string[];
};

export async function logAssistantEntry(
  entry: Omit<AssistantLogEntry, "id">
): Promise<void> {
  await appendFile(
    LOG_PATH,
    `${JSON.stringify({ ...entry, id: randomUUID() })}\n`,
    "utf8"
  );
}

function parseLine(line: string, fallbackId: string): AssistantLogEntry | null {
  try {
    const parsed = JSON.parse(line) as Partial<AssistantLogEntry>;
    if (
      typeof parsed.timestamp === "string" &&
      typeof parsed.question === "string" &&
      (parsed.mode === "ai" || parsed.mode === "keyword") &&
      typeof parsed.matched === "boolean" &&
      Array.isArray(parsed.sources)
    ) {
      return {
        id: typeof parsed.id === "string" && parsed.id ? parsed.id : fallbackId,
        timestamp: parsed.timestamp,
        question: parsed.question,
        mode: parsed.mode,
        matched: parsed.matched,
        sources: parsed.sources,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function getAssistantLog(): Promise<AssistantLogEntry[]> {
  let raw: string;
  try {
    raw = await readFile(LOG_PATH, "utf8");
  } catch {
    return [];
  }

  const entries: AssistantLogEntry[] = [];
  const lines = raw.split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    const entry = parseLine(line, `line-${index}`);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries.reverse();
}

export async function deleteAssistantEntry(id: string): Promise<boolean> {
  let raw: string;
  try {
    raw = await readFile(LOG_PATH, "utf8");
  } catch {
    return false;
  }

  const lines = raw.split("\n");
  const kept: string[] = [];
  let removed = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    const entry = parseLine(line, `line-${index}`);
    if (entry && entry.id === id) {
      removed = true;
      continue;
    }
    kept.push(line);
  }

  if (removed) {
    await writeFile(
      LOG_PATH,
      kept.length > 0 ? `${kept.join("\n")}\n` : "",
      "utf8"
    );
  }
  return removed;
}
