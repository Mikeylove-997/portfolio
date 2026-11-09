"use server";

import { promises as fs } from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  project: string | null;
  submittedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "submissions.json");

export async function saveContactMessage(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const projectParam = String(formData.get("project") ?? "").trim();

  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !message || !emailIsValid) {
    redirect("/contact-me-server-form?status=error");
  }

  const project = projectParam && getProjectBySlug(projectParam) ? projectParam : null;

  const submission: ContactSubmission = {
    id: crypto.randomUUID(),
    name,
    email,
    message,
    project,
    submittedAt: new Date().toISOString(),
  };

  let submissions: ContactSubmission[] = [];
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
    if (Array.isArray(parsed)) submissions = parsed;
  } catch {
    submissions = [];
  }

  submissions.push(submission);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(submissions, null, 2), "utf8");

  if (project) {
    redirect(`/projects/${project}?submitted=1`);
  }
  redirect("/contact-me-server-form?submitted=1");
}
