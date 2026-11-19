"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Project = {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  repoUrl: string;
  liveUrl?: string;
};

type FieldErrors = {
  title?: string;
  description?: string;
  techStack?: string;
  features?: string;
  repoUrl?: string;
  liveUrl?: string;
};

const EMPTY_FORM = {
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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

    if (!window.confirm("Delete this project?")) {
      return;
    }

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

      <div className="card form-card">
        <h2>{editingSlug ? "Edit Project" : "Add a New Project"}</h2>
        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="field">
            <label htmlFor="project-title">Title</label>
            <input
              id="project-title"
              name="title"
              type="text"
              placeholder="Financial Company Brain"
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
            />
            {fieldErrors.title ? (
              <p className="field-error">{fieldErrors.title}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="project-description">Description</label>
            <textarea
              id="project-description"
              name="description"
              rows={3}
              placeholder="One short paragraph: what it does and how."
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
            {fieldErrors.description ? (
              <p className="field-error">{fieldErrors.description}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="project-tech-stack">Tech Stack (one per line)</label>
            <textarea
              id="project-tech-stack"
              name="techStack"
              rows={4}
              placeholder={"Python\nStreamlit\nLLM"}
              value={form.techStackText}
              onChange={(event) =>
                setForm({ ...form, techStackText: event.target.value })
              }
            />
            {fieldErrors.techStack ? (
              <p className="field-error">{fieldErrors.techStack}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="project-features">Key Features (one per line)</label>
            <textarea
              id="project-features"
              name="features"
              rows={4}
              placeholder={"Variance analysis\nCited answers"}
              value={form.featuresText}
              onChange={(event) =>
                setForm({ ...form, featuresText: event.target.value })
              }
            />
            {fieldErrors.features ? (
              <p className="field-error">{fieldErrors.features}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="project-repo-url">Repository URL</label>
            <input
              id="project-repo-url"
              name="repoUrl"
              type="url"
              placeholder="https://github.com/yourname/repo"
              value={form.repoUrl}
              onChange={(event) =>
                setForm({ ...form, repoUrl: event.target.value })
              }
            />
            {fieldErrors.repoUrl ? (
              <p className="field-error">{fieldErrors.repoUrl}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="project-live-url">Live URL (optional)</label>
            <input
              id="project-live-url"
              name="liveUrl"
              type="url"
              placeholder="https://your-app.example.com"
              value={form.liveUrl}
              onChange={(event) =>
                setForm({ ...form, liveUrl: event.target.value })
              }
            />
            {fieldErrors.liveUrl ? (
              <p className="field-error">{fieldErrors.liveUrl}</p>
            ) : null}
          </div>
          <button type="submit" disabled={sending}>
            {sending
              ? "Saving..."
              : editingSlug
                ? "Save Changes"
                : "Create Project"}
          </button>
        </form>
      </div>

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
                  onClick={() => startEdit(project)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => handleDelete(project)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
