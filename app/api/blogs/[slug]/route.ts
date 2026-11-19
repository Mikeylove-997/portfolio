import { NextResponse } from "next/server";
import { deleteBlog, getBlogBySlug, updateBlog } from "@/lib/blogs";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/blogs/[slug]">
) {
  const { slug } = await params;
  const post = await getBlogBySlug(slug);

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/blogs/[slug]">
) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { title: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  const { title, content } = (body ?? {}) as Record<string, unknown>;
  const input = {
    title: typeof title === "string" ? title : "",
    content: typeof content === "string" ? content : "",
  };

  const errors: Record<string, string> = {};
  if (!input.title.trim()) {
    errors.title = "Title is required.";
  }
  if (!input.content.trim()) {
    errors.content = "Content is required.";
  }
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const updated = await updateBlog(slug, input);

  if (!updated) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/blogs/[slug]">
) {
  const { slug } = await params;
  const deleted = await deleteBlog(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
