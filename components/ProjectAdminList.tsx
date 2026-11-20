"use client";

import Link from "next/link";
import type { Project } from "@/components/ProjectCard";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

export default function ProjectAdminList({
  projects,
  loading,
  onEdit,
  onDelete,
}: {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}) {
  return (
    <>
      <h2 className="admin-list-heading">Existing Projects</h2>
      {loading ? (
        <p className="muted">Loading projects...</p>
      ) : projects.length === 0 ? (
        <p className="muted">
          No projects yet. Use the form above to create one.
        </p>
      ) : (
        <div className="card blog-list-card">
          {projects.map((project) => (
            <div key={project.slug} className="blog-row">
              <div>
                <Link href={`/projects/${project.slug}`} className="view-link">
                  {project.title}
                </Link>
                <p className="post-date">
                  {project.slug} · {project.techStack.join(", ")}
                </p>
              </div>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onEdit(project)}
                >
                  Edit
                </button>
                <ConfirmDeleteButton
                  confirmMessage="Delete this project?"
                  onConfirmed={() => onDelete(project)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
