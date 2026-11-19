import type { Metadata } from "next";
import Link from "next/link";
import ProjectManager from "@/components/ProjectManager";

export const metadata: Metadata = {
  title: "Admin — Projects",
  robots: { index: false },
};

export default function AdminProjectsPage() {
  return (
    <main className="container page">
      <Link href="/admin" className="back-link">
        ← Admin
      </Link>
      <h1>Projects</h1>
      <p className="lead">
        Creating a project sends a <code>POST /api/projects</code> request and
        generates the slug from the title; editing uses{" "}
        <code>PUT /api/projects/[slug]</code> and keeps the same slug so
        existing links never break. Deleting asks for confirmation first.
      </p>
      <ProjectManager />
    </main>
  );
}
