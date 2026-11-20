"use client";

import Link from "next/link";
import type { BlogPost } from "@/components/BlogCard";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

export default function BlogAdminList({
  posts,
  loading,
  onEdit,
  onDelete,
}: {
  posts: BlogPost[];
  loading: boolean;
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}) {
  return (
    <>
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
                  onClick={() => onEdit(post)}
                >
                  Edit
                </button>
                <ConfirmDeleteButton
                  confirmMessage="Delete this post?"
                  onConfirmed={() => onDelete(post)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
