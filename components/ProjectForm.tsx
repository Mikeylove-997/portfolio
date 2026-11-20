"use client";

import FieldError from "@/components/FieldError";

export type ProjectFormState = {
  title: string;
  description: string;
  techStackText: string;
  featuresText: string;
  repoUrl: string;
  liveUrl: string;
};

export type ProjectFieldErrors = {
  title?: string;
  description?: string;
  techStack?: string;
  features?: string;
  repoUrl?: string;
  liveUrl?: string;
};

export default function ProjectForm({
  form,
  fieldErrors,
  sending,
  editingSlug,
  onChange,
  onSubmit,
}: {
  form: ProjectFormState;
  fieldErrors: ProjectFieldErrors;
  sending: boolean;
  editingSlug: string | null;
  onChange: (next: ProjectFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="card form-card">
      <h2>{editingSlug ? "Edit Project" : "Add a New Project"}</h2>
      <form onSubmit={onSubmit} className="form" noValidate>
        <div className="field">
          <label htmlFor="project-title">Title</label>
          <input
            id="project-title"
            name="title"
            type="text"
            placeholder="Financial Company Brain"
            value={form.title}
            onChange={(event) =>
              onChange({ ...form, title: event.target.value })
            }
          />
          <FieldError message={fieldErrors.title} />
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
              onChange({ ...form, description: event.target.value })
            }
          />
          <FieldError message={fieldErrors.description} />
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
              onChange({ ...form, techStackText: event.target.value })
            }
          />
          <FieldError message={fieldErrors.techStack} />
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
              onChange({ ...form, featuresText: event.target.value })
            }
          />
          <FieldError message={fieldErrors.features} />
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
              onChange({ ...form, repoUrl: event.target.value })
            }
          />
          <FieldError message={fieldErrors.repoUrl} />
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
              onChange({ ...form, liveUrl: event.target.value })
            }
          />
          <FieldError message={fieldErrors.liveUrl} />
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
  );
}
