import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";

const LOG_PATH = path.join(process.cwd(), "data", "assistant-log.jsonl");

export type AssistantLogEntry = {
  timestamp: string;
  question: string;
  mode: "ai" | "keyword";
  matched: boolean;
  sources: string[];
};

export async function logAssistantEntry(
  entry: AssistantLogEntry
): Promise<void> {
  await appendFile(LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
}

export async function getAssistantLog(): Promise<AssistantLogEntry[]> {
  let raw: string;
  try {
    raw = await readFile(LOG_PATH, "utf8");
  } catch {
    return [];
  }

  const entries: AssistantLogEntry[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as Partial<AssistantLogEntry>;
      if (
        typeof parsed.timestamp === "string" &&
        typeof parsed.question === "string" &&
        (parsed.mode === "ai" || parsed.mode === "keyword") &&
        typeof parsed.matched === "boolean" &&
        Array.isArray(parsed.sources)
      ) {
        entries.push({
          timestamp: parsed.timestamp,
          question: parsed.question,
          mode: parsed.mode,
          matched: parsed.matched,
          sources: parsed.sources,
        });
      }
    } catch {
      continue;
    }
  }

  return entries.reverse();
}
