"use client";

import { useEffect, useState } from "react";
import type { BlogPost } from "@/components/BlogCard";
import BlogForm from "@/components/BlogForm";
import type { BlogFieldErrors, BlogFormState } from "@/components/BlogForm";
import BlogAdminList from "@/components/BlogAdminList";

const EMPTY_FORM: BlogFormState = {
  title: "",
  content: "",
};

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<BlogFieldErrors>({});
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

      <BlogForm
        form={form}
        fieldErrors={fieldErrors}
        sending={sending}
        editingSlug={editingSlug}
        onChange={setForm}
        onSubmit={handleSubmit}
      />

      <BlogAdminList
        posts={posts}
        loading={loading}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
