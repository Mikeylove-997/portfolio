import Link from "next/link";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
};

function excerpt(content: string): string {
  return content.length > 140
    ? `${content.slice(0, 140).trimEnd()}...`
    : content;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeZone: "America/Los_Angeles",
  });
}

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blogs/${post.slug}`} className="card project-card">
      <p className="post-date">
        {formatDate(post.createdAt)}
      </p>
      <h2>{post.title}</h2>
      <p>{excerpt(post.content)}</p>
      <span className="view-link">Read post →</span>
    </Link>
  );
}
