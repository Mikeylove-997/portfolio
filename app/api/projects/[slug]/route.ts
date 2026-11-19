import { NextResponse } from "next/server";
import {
  deleteProject,
  getProjectBySlug,
  updateProject,
  validateProjectInput,
} from "@/lib/projects";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/projects/[slug]">
) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(project);
}

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/projects/[slug]">
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

  const { input, errors } = validateProjectInput(body);

  if (!input) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const updated = await updateProject(slug, input);

  if (!updated) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/projects/[slug]">
) {
  const { slug } = await params;
  const deleted = await deleteProject(slug);

  if (!deleted) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
