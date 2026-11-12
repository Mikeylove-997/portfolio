import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main className="container page">
      <h1>Post not found</h1>
      <p className="lead">
        That blog post doesn&apos;t exist — it may have been renamed or never
        published.
      </p>
      <Link href="/blogs" className="btn secondary">
        ← Back to all posts
      </Link>
    </main>
  );
}
