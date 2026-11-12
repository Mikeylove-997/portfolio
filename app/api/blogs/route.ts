import { NextResponse } from "next/server";
import { connection } from "next/server";
import { addBlog, getAllBlogs } from "@/lib/blogs";

export async function GET() {
  await connection();

  const blogs = await getAllBlogs();
  const sorted = [...blogs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
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

  const result = await addBlog(input);

  if (!result.ok) {
    if (result.reason === "duplicate-slug") {
      return NextResponse.json(
        {
          error: `A post with slug "${result.slug}" already exists.`,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { errors: { title: "Title must contain letters or numbers." } },
      { status: 400 }
    );
  }

  return NextResponse.json(result.post, { status: 201 });
}
