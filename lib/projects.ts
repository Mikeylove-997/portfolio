import { promises as fs } from "node:fs";
import path from "node:path";

export type Project = {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  repoUrl: string;
  liveUrl?: string;
};

export type ProjectInput = {
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  repoUrl: string;
  liveUrl?: string;
};

export type AddProjectResult =
  | { ok: true; project: Project }
  | { ok: false; reason: "duplicate-slug"; slug: string }
  | { ok: false; reason: "empty-slug" };

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "projects.json");

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getAllProjects(): Promise<Project[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function addProject(
  input: ProjectInput
): Promise<AddProjectResult> {
  const trimmedTitle = input.title.trim();
  const slug = slugify(trimmedTitle);

  if (!slug) {
    return { ok: false, reason: "empty-slug" };
  }

  const projects = await getAllProjects();
  if (projects.some((project) => project.slug === slug)) {
    return { ok: false, reason: "duplicate-slug", slug };
  }

  const project: Project = {
    slug,
    title: trimmedTitle,
    description: input.description.trim(),
    techStack: input.techStack,
    features: input.features,
    repoUrl: input.repoUrl.trim(),
    ...(input.liveUrl ? { liveUrl: input.liveUrl.trim() } : {}),
  };

  projects.push(project);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), "utf8");

  return { ok: true, project };
}

export async function updateProject(
  slug: string,
  input: ProjectInput
): Promise<Project | null> {
  const projects = await getAllProjects();
  const index = projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return null;
  }

  const updated: Project = {
    ...projects[index],
    title: input.title.trim(),
    description: input.description.trim(),
    techStack: input.techStack,
    features: input.features,
    repoUrl: input.repoUrl.trim(),
  };

  if (input.liveUrl) {
    updated.liveUrl = input.liveUrl.trim();
  } else {
    delete updated.liveUrl;
  }

  projects[index] = updated;

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), "utf8");

  return updated;
}

export async function deleteProject(slug: string): Promise<boolean> {
  const projects = await getAllProjects();
  const remaining = projects.filter((project) => project.slug !== slug);

  if (remaining.length === projects.length) {
    return false;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(remaining, null, 2), "utf8");

  return true;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateProjectInput(body: unknown): {
  input: ProjectInput | null;
  errors: Record<string, string>;
} {
  const source = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  const title = typeof source.title === "string" ? source.title.trim() : "";
  const description =
    typeof source.description === "string" ? source.description.trim() : "";
  const repoUrl = typeof source.repoUrl === "string" ? source.repoUrl.trim() : "";
  const liveUrlValue =
    typeof source.liveUrl === "string" ? source.liveUrl.trim() : "";

  if (!title) {
    errors.title = "Title is required.";
  }
  if (!description) {
    errors.description = "Description is required.";
  }
  if (!repoUrl) {
    errors.repoUrl = "Repository URL is required.";
  } else if (!isValidHttpUrl(repoUrl)) {
    errors.repoUrl = "Repository URL must be a valid http(s) URL.";
  }

  if (liveUrlValue && !isValidHttpUrl(liveUrlValue)) {
    errors.liveUrl = "Live URL must be a valid http(s) URL.";
  }

  const parseList = (value: unknown, label: string): string[] | null => {
    if (!Array.isArray(value)) {
      errors[label] = label === "techStack"
        ? "Tech stack must be a list."
        : "Features must be a list.";
      return null;
    }
    const cleaned = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (cleaned.length === 0) {
      errors[label] = label === "techStack"
        ? "At least one technology is required."
        : "At least one feature is required.";
      return null;
    }
    return cleaned;
  };

  const techStack = parseList(source.techStack, "techStack");
  const features = parseList(source.features, "features");

  if (Object.keys(errors).length > 0) {
    return { input: null, errors };
  }

  return {
    input: {
      title,
      description,
      techStack: techStack ?? [],
      features: features ?? [],
      repoUrl,
      ...(liveUrlValue ? { liveUrl: liveUrlValue } : {}),
    },
    errors,
  };
}
