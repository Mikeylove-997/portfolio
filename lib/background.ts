import { promises as fs } from "node:fs";
import path from "node:path";

export type BackgroundSection = {
  title: string;
  content: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "background.md");

const PLACEHOLDER_PATTERN = /^\(to be written/i;

export async function getBackgroundSections(): Promise<BackgroundSection[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return raw
      .split(/^## /m)
      .slice(1)
      .map((chunk) => {
        const [titleLine, ...rest] = chunk.split("\n");
        return {
          title: titleLine.trim(),
          content: rest.join("\n").trim(),
        };
      })
      .filter(
        (section) =>
          section.title.length > 0 &&
          section.content.length > 0 &&
          !PLACEHOLDER_PATTERN.test(section.content)
      );
  } catch {
    return [];
  }
}
