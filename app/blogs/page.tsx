import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Posts about building things with code.",
};

export default function BlogsPage() {
  return (
    <main className="container page">
      <h1>Blog</h1>
      <p className="lead">
        Notes from building projects — loaded live from the{" "}
        <code>GET /api/blogs</code> endpoint.
      </p>
      <Suspense fallback={<p className="lead">Loading posts...</p>}>
        <BlogList />
      </Suspense>
    </main>
  );
}

async function BlogList() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.")
    ? "http"
    : "https";

  const response = await fetch(`${protocol}://${host}/api/blogs`, {
    cache: "no-store",
  });
  const posts: BlogPost[] = response.ok ? await response.json() : [];

  if (posts.length === 0) {
    return (
      <p className="banner success">
        No posts yet — check back soon, or add one from the admin page.
      </p>
    );
  }

  return (
    <div className="grid">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`/blogs/${post.slug}`}
          className="card project-card"
        >
          <p className="post-date">
            {formatDate(post.createdAt)}
          </p>
          <h2>{post.title}</h2>
          <p>{excerpt(post.content)}</p>
          <span className="view-link">Read post →</span>
        </Link>
      ))}
    </div>
  );
}

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
};

function excerpt(content: string): string {
  return content.length > 140
    ? `${content.slice(0, 140).trimEnd()}...`
    : content;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeZone: "America/Los_Angeles",
  });
}
