"use client";

import FieldError from "@/components/FieldError";

export type BlogFormState = {
  title: string;
  content: string;
};

export type BlogFieldErrors = {
  title?: string;
  content?: string;
};

export default function BlogForm({
  form,
  fieldErrors,
  sending,
  editingSlug,
  onChange,
  onSubmit,
}: {
  form: BlogFormState;
  fieldErrors: BlogFieldErrors;
  sending: boolean;
  editingSlug: string | null;
  onChange: (next: BlogFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="card form-card">
      <h2>{editingSlug ? "Edit Post" : "Write a New Post"}</h2>
      <form onSubmit={onSubmit} className="form" noValidate>
        <div className="field">
          <label htmlFor="blog-title">Title</label>
          <input
            id="blog-title"
            name="title"
            type="text"
            placeholder="How I Built..."
            value={form.title}
            onChange={(event) =>
              onChange({ ...form, title: event.target.value })
            }
          />
          <FieldError message={fieldErrors.title} />
        </div>
        <div className="field">
          <label htmlFor="blog-content">Content</label>
          <textarea
            id="blog-content"
            name="content"
            rows={8}
            placeholder="Write your post... Separate paragraphs with a blank line."
            value={form.content}
            onChange={(event) =>
              onChange({ ...form, content: event.target.value })
            }
          />
          <FieldError message={fieldErrors.content} />
        </div>
        <button type="submit" disabled={sending}>
          {sending
            ? "Saving..."
            : editingSlug
              ? "Save Changes"
              : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
