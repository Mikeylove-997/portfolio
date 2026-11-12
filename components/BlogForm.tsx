"use client";

import Link from "next/link";
import { useState } from "react";

type CreatedPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
};

type FieldErrors = {
  title?: string;
  content?: string;
};

export default function BlogForm() {
  const [created, setCreated] = useState<CreatedPost | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setFailed(false);
    setDuplicateMessage(null);

    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
    };

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        const post: CreatedPost = await response.json();
        setCreated(post);
        setFieldErrors({});
        form.reset();
        window.dispatchEvent(new Event("blog-created"));
      } else if (response.status === 400) {
        const data = await response.json();
        setCreated(null);
        setFieldErrors(data.errors ?? {});
      } else if (response.status === 409) {
        const data = await response.json();
        setCreated(null);
        setFieldErrors({});
        setDuplicateMessage(data.error ?? "A post with that title already exists.");
      } else {
        setCreated(null);
        setFailed(true);
      }
    } catch {
      setCreated(null);
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card form-card">
      {created ? (
        <p className="banner success" role="status">
          Post published!{" "}
          <Link href={`/blogs/${created.slug}`} className="view-link">
            View &ldquo;{created.title}&rdquo; →
          </Link>
        </p>
      ) : null}
      {duplicateMessage ? (
        <p className="banner error" role="alert">
          {duplicateMessage} Try a different title.
        </p>
      ) : null}
      {failed ? (
        <p className="banner error" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="field">
          <label htmlFor="blog-title">Title</label>
          <input
            id="blog-title"
            name="title"
            type="text"
            placeholder="How I Built..."
          />
          {fieldErrors.title ? (
            <p className="field-error">{fieldErrors.title}</p>
          ) : null}
        </div>
        <div className="field">
          <label htmlFor="blog-content">Content</label>
          <textarea
            id="blog-content"
            name="content"
            rows={8}
            placeholder="Write your post... Separate paragraphs with a blank line."
          />
          {fieldErrors.content ? (
            <p className="field-error">{fieldErrors.content}</p>
          ) : null}
        </div>
        <button type="submit" disabled={sending}>
          {sending ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
