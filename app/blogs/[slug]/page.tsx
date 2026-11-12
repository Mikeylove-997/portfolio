import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getBlogBySlug } from "@/lib/blogs";

export default function BlogPostPage(props: PageProps<"/blogs/[slug]">) {
  return (
    <main className="container page">
      <Suspense fallback={<p className="lead">Loading post...</p>}>
        <BlogContent params={props.params} />
      </Suspense>
    </main>
  );
}

async function BlogContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article>
      <Link href="/blogs" className="back-link">
        ← All Posts
      </Link>
      <h1>{post.title}</h1>
      <p className="post-date">{formatDate(post.createdAt)}</p>
      <div className="post-content">
        {post.content.split("\n\n").map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeZone: "America/Los_Angeles",
  });
}
