import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import type { ComponentProps } from "react";
import BlogCard from "@/components/BlogCard";

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
  const posts: BlogCardData[] = response.ok ? await response.json() : [];

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
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}

type BlogCardData = ComponentProps<typeof BlogCard>["post"];
