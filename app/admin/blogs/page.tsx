import type { Metadata } from "next";
import Link from "next/link";
import BlogForm from "@/components/BlogForm";
import BlogList from "@/components/BlogList";

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
        Publishing here sends a <code>POST /api/blogs</code> request — new
        posts appear on <code>/blogs</code> immediately, with the slug
        generated from the title.
      </p>
      <BlogForm />
      <h2>Existing Posts</h2>
      <p className="lead">
        Deleting a post removes it from <code>/blogs</code> immediately. You
        will be asked to confirm first.
      </p>
      <BlogList />
    </main>
  );
}
