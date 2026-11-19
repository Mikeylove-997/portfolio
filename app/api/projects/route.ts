import { NextResponse } from "next/server";
import { connection } from "next/server";
import { addProject, getAllProjects, validateProjectInput } from "@/lib/projects";

export async function GET() {
  await connection();

  const projects = await getAllProjects();
  return NextResponse.json(projects);
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

  const { input, errors } = validateProjectInput(body);

  if (!input) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const result = await addProject(input);

  if (!result.ok) {
    if (result.reason === "duplicate-slug") {
      return NextResponse.json(
        {
          error: `A project with slug "${result.slug}" already exists.`,
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { errors: { title: "Title must contain letters or numbers." } },
      { status: 400 }
    );
  }

  return NextResponse.json(result.project, { status: 201 });
}
