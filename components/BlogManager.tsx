"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BlogPost = {
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

const EMPTY_FORM = {
  title: "",
  content: "",
};

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [duplicateMessage, setDuplicateMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/blogs", { cache: "no-store" });
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function refresh() {
    const res = await fetch("/api/blogs", { cache: "no-store" });
    if (res.ok) {
      setPosts(await res.json());
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFailed(false);
    setMessage(null);
    setDuplicateMessage(null);
    setFieldErrors({});

    try {
      const response = editingSlug
        ? await fetch(`/api/blogs/${editingSlug}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: form.title,
              content: form.content,
            }),
          })
        : await fetch("/api/blogs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: form.title,
              content: form.content,
            }),
          });

      if (response.status === 201 || response.status === 200) {
        const saved: BlogPost = await response.json();
        await refresh();
        setForm(EMPTY_FORM);
        setEditingSlug(null);
        setMessage(
          editingSlug
            ? "Post updated."
            : `Post published: "${saved.title}"`
        );
      } else if (response.status === 400) {
        const data = await response.json();
        setFieldErrors(data.errors ?? {});
      } else if (response.status === 409) {
        const data = await response.json();
        setDuplicateMessage(
          data.error ?? "A post with that title already exists."
        );
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

  function startEdit(post: BlogPost) {
    setEditingSlug(post.slug);
    setForm({ title: post.title, content: post.content });
    setFieldErrors({});
    setDuplicateMessage(null);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingSlug(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setDuplicateMessage(null);
    setMessage(null);
  }

  async function handleDelete(post: BlogPost) {
    setFailed(false);
    setMessage(null);

    if (!window.confirm("Delete this post?")) {
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${post.slug}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        setPosts((current) => current.filter((p) => p.slug !== post.slug));
        setMessage("Post deleted.");
        if (editingSlug === post.slug) {
          cancelEdit();
        }
        return;
      }

      if (res.status === 404) {
        setPosts((current) => current.filter((p) => p.slug !== post.slug));
        setMessage("That post was already deleted.");
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
      {duplicateMessage ? (
        <p className="banner error" role="alert">
          {duplicateMessage}
        </p>
      ) : null}
      {failed ? (
        <p className="banner error" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}

      <div className="card form-card">
        <h2>{editingSlug ? "Edit Post" : "Write a New Post"}</h2>
        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="field">
            <label htmlFor="blog-title">Title</label>
            <input
              id="blog-title"
              name="title"
              type="text"
              placeholder="How I Built..."
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
            <label htmlFor="blog-content">Content</label>
            <textarea
              id="blog-content"
              name="content"
              rows={8}
              placeholder="Write your post... Separate paragraphs with a blank line."
              value={form.content}
              onChange={(event) =>
                setForm({ ...form, content: event.target.value })
              }
            />
            {fieldErrors.content ? (
              <p className="field-error">{fieldErrors.content}</p>
            ) : null}
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

      <h2 className="admin-list-heading">Existing Posts</h2>
      {loading ? (
        <p className="muted">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="muted">
          No posts yet. Use the form above to create one.
        </p>
      ) : (
        <div className="card blog-list-card">
          {posts.map((post) => (
            <div key={post.slug} className="blog-row">
              <div>
                <Link href={`/blogs/${post.slug}`} className="view-link">
                  {post.title}
                </Link>
                <p className="post-date">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => startEdit(post)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn danger"
                  onClick={() => handleDelete(post)}
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
