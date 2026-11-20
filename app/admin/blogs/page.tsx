import type { Metadata } from "next";
import BlogManager from "@/components/BlogManager";
import AdminPageHeader from "@/components/AdminPageHeader";

export const metadata: Metadata = {
  title: "Admin — Blog Posts",
  robots: { index: false },
};

export default function AdminBlogsPage() {
  return (
    <main className="container page">
      <AdminPageHeader
        title="Blog Posts"
        lead={
          <>
            Creating a post sends a <code>POST /api/blogs</code> request and
            generates the slug from the title; editing uses{" "}
            <code>PUT /api/blogs/[slug]</code> and keeps the same slug so
            existing links never break. Deleting asks for confirmation first.
          </>
        }
        backHref="/admin"
      />
      <BlogManager />
    </main>
  );
}
