import type { Metadata } from "next";
import ProjectManager from "@/components/ProjectManager";
import AdminPageHeader from "@/components/AdminPageHeader";

export const metadata: Metadata = {
  title: "Admin — Projects",
  robots: { index: false },
};

export default function AdminProjectsPage() {
  return (
    <main className="container page">
      <AdminPageHeader
        title="Projects"
        lead={
          <>
            Creating a project sends a <code>POST /api/projects</code> request
            and generates the slug from the title; editing uses{" "}
            <code>PUT /api/projects/[slug]</code> and keeps the same slug so
            existing links never break. Deleting asks for confirmation first.
          </>
        }
        backHref="/admin"
      />
      <ProjectManager />
    </main>
  );
}
