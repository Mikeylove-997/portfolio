import type { Metadata } from "next";
import Link from "next/link";
import BlogManager from "@/components/BlogManager";

export const metadata: Metadata = {
  title: "Admin — Blog Posts",
  robots: { index: false },
};

export default function AdminBlogsPage() {
  return (
    <main className="container page">
      <Link href="/admin" className="back-link">
        ← Admin
      </Link>
      <h1>Blog Posts</h1>
      <p className="lead">
        Creating a post sends a <code>POST /api/blogs</code> request and
        generates the slug from the title; editing uses{" "}
        <code>PUT /api/blogs/[slug]</code> and keeps the same slug so existing
        links never break. Deleting asks for confirmation first.
      </p>
      <BlogManager />
    </main>
  );
}
