import { NextResponse } from "next/server";
import { deleteBlog } from "@/lib/blogs";

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
