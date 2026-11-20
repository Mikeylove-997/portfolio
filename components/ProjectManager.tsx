"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/components/ProjectCard";
import ProjectForm from "@/components/ProjectForm";
import type { ProjectFieldErrors, ProjectFormState } from "@/components/ProjectForm";
import ProjectAdminList from "@/components/ProjectAdminList";

const EMPTY_FORM: ProjectFormState = {
  title: "",
  description: "",
  techStackText: "",
  featuresText: "",
  repoUrl: "",
  liveUrl: "",
};

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProjectFieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/projects", { cache: "no-store" });
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function refresh() {
    const res = await fetch("/api/projects", { cache: "no-store" });
    if (res.ok) {
      setProjects(await res.json());
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFailed(false);
    setMessage(null);
    setFieldErrors({});

    const payload = {
      title: form.title,
      description: form.description,
      techStack: form.techStackText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      features: form.featuresText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      repoUrl: form.repoUrl,
      liveUrl: form.liveUrl,
    };

    try {
      const response = editingSlug
        ? await fetch(`/api/projects/${editingSlug}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (response.status === 201 || response.status === 200) {
        await refresh();
        setForm(EMPTY_FORM);
        setEditingSlug(null);
        setMessage(
          editingSlug
            ? "Project updated."
            : "Project created."
        );
      } else if (response.status === 400) {
        const data = await response.json();
        setFieldErrors(data.errors ?? {});
      } else if (response.status === 409) {
        const data = await response.json();
        setMessage(data.error ?? "A project with that slug already exists.");
        setFieldErrors({ title: "Try a different title." });
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  function startEdit(project: Project) {
    setEditingSlug(project.slug);
    setForm({
      title: project.title,
      description: project.description,
      techStackText: project.techStack.join("\n"),
      featuresText: project.features.join("\n"),
      repoUrl: project.repoUrl,
      liveUrl: project.liveUrl ?? "",
    });
    setFieldErrors({});
    setMessage(null);
  }

  function cancelEdit() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setMessage(null);
  }

  async function handleDelete(project: Project) {
    setFailed(false);
    setMessage(null);

    try {
      const res = await fetch(`/api/projects/${project.slug}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        setProjects((current) =>
          current.filter((p) => p.slug !== project.slug)
        );
        setMessage("Project deleted.");
        if (editingSlug === project.slug) {
          cancelEdit();
        }
        return;
      }

      if (res.status === 404) {
        setProjects((current) =>
          current.filter((p) => p.slug !== project.slug)
        );
        setFailed(true);
        return;
      }

      setFailed(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div>
      {editingSlug ? (
        <p className="banner success" role="status">
          Editing <strong>{editingSlug}</strong> — the slug stays the same so
          existing links keep working.{" "}
          <button type="button" className="view-link" onClick={cancelEdit}>
            Cancel edit
          </button>
        </p>
      ) : null}
      {message ? (
        <p className="banner success" role="status">
          {message}
        </p>
      ) : null}
      {failed ? (
        <p className="banner error" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}

      <ProjectForm
        form={form}
        fieldErrors={fieldErrors}
        sending={sending}
        editingSlug={editingSlug}
        onChange={setForm}
        onSubmit={handleSubmit}
      />

      <ProjectAdminList
        projects={projects}
        loading={loading}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
