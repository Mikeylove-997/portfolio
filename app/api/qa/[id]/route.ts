import { NextResponse } from "next/server";
import { deleteQA, getQAById, updateQA, validateQAInput } from "@/lib/qa";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/qa/[id]">
) {
  const { id } = await params;
  const entry = await getQAById(id);

  if (!entry) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  return NextResponse.json(entry);
}

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/qa/[id]">
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { question: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  const { input, errors } = validateQAInput(body);

  if (!input) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const updated = await updateQA(id, input);

  if (!updated) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/qa/[id]">
) {
  const { id } = await params;
  const deleted = await deleteQA(id);

  if (!deleted) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
