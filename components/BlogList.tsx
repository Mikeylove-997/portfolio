"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BlogList() {
  const [posts, setPosts] = useState<
    { id: string; slug: string; title: string; createdAt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [deletedMessage, setDeletedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const res = await fetch("/api/blogs", { cache: "no-store" });
        const data = await res.json();
        if (!ignore) setPosts(data);
      } catch {
        if (!ignore) setError("Could not load posts. Please refresh the page.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    function refresh() {
      load();
    }

    window.addEventListener("blog-created", refresh);

    return () => {
      ignore = true;
      window.removeEventListener("blog-created", refresh);
    };
  }, []);

  async function handleDelete(slug: string) {
    setError(null);
    setDeletedMessage(null);

    if (!window.confirm("Delete this post?")) {
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${slug}`, { method: "DELETE" });

      if (res.status === 204) {
        setPosts((current) => current.filter((post) => post.slug !== slug));
        setDeletedMessage("Post deleted.");
        return;
      }

      if (res.status === 404) {
        setPosts((current) => current.filter((post) => post.slug !== slug));
        setError("That post was already deleted.");
        return;
      }

      setError("Could not delete the post. Please try again.");
    } catch {
      setError("Could not delete the post. Please try again.");
    }
  }

  if (loading) {
    return <p className="muted">Loading posts...</p>;
  }

  if (posts.length === 0) {
    return <p className="muted">No posts yet. Use the form above to create one.</p>;
  }

  return (
    <div>
      {deletedMessage && (
        <p className="form-message success" role="status">
          {deletedMessage}
        </p>
      )}
      {error && (
        <p className="form-message error" role="alert">
          {error}
        </p>
      )}
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
            <button
              type="button"
              className="btn danger"
              onClick={() => handleDelete(post.slug)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
