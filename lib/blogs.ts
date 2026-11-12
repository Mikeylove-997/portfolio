import { promises as fs } from "node:fs";
import path from "node:path";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
};

export type AddBlogResult =
  | { ok: true; post: BlogPost }
  | { ok: false; reason: "duplicate-slug"; slug: string }
  | { ok: false; reason: "empty-slug" };

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "blogs.json");

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getAllBlogs(): Promise<BlogPost[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const blogs = await getAllBlogs();
  return blogs.find((post) => post.slug === slug) ?? null;
}

export async function addBlog({
  title,
  content,
}: {
  title: string;
  content: string;
}): Promise<AddBlogResult> {
  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const slug = slugify(trimmedTitle);

  if (!slug) {
    return { ok: false, reason: "empty-slug" };
  }

  const blogs = await getAllBlogs();
  if (blogs.some((post) => post.slug === slug)) {
    return { ok: false, reason: "duplicate-slug", slug };
  }

  const post: BlogPost = {
    id: crypto.randomUUID(),
    slug,
    title: trimmedTitle,
    content: trimmedContent,
    createdAt: new Date().toISOString(),
  };

  blogs.push(post);

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(blogs, null, 2), "utf8");

  return { ok: true, post };
}

export async function deleteBlog(slug: string): Promise<boolean> {
  const blogs = await getAllBlogs();
  const remaining = blogs.filter((post) => post.slug !== slug);

  if (remaining.length === blogs.length) {
    return false;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(remaining, null, 2), "utf8");

  return true;
}
