import { promises as fs } from "node:fs";
import path from "node:path";

export type ContactSource = "api" | "server-action";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  project: string | null;
  source: ContactSource | null;
  submittedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

export async function readContacts(): Promise<ContactSubmission[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.map((entry) => ({
      ...entry,
      source:
        entry.source === "api" || entry.source === "server-action"
          ? entry.source
          : null,
    }));
  } catch {
    return [];
  }
}

export async function addContact(
  contact: Omit<ContactSubmission, "id" | "submittedAt">
): Promise<ContactSubmission> {
  const submission: ContactSubmission = {
    id: crypto.randomUUID(),
    name: contact.name,
    email: contact.email,
    message: contact.message,
    project: contact.project,
    source: contact.source,
    submittedAt: new Date().toISOString(),
  };

  const contacts = await readContacts();
  contacts.push(submission);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2), "utf8");

  return submission;
}
