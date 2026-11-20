import { NextResponse } from "next/server";
import { connection } from "next/server";
import {
  deleteExperience,
  getExperienceById,
  updateExperience,
  validateExperienceInput,
} from "@/lib/experience";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/experience/[id]">
) {
  await connection();
  const { id } = await params;

  const entry = await getExperienceById(id);
  if (!entry) {
    return NextResponse.json({ error: "Experience entry not found." }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/experience/[id]">
) {
  await connection();
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { company: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  const { input, errors } = validateExperienceInput(body);
  if (!input) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const updated = await updateExperience(id, input);
  if (!updated) {
    return NextResponse.json({ error: "Experience entry not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/experience/[id]">
) {
  await connection();
  const { id } = await params;

  const deleted = await deleteExperience(id);
  if (!deleted) {
    return NextResponse.json({ error: "Experience entry not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
