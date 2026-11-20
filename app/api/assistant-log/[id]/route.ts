import { NextResponse } from "next/server";
import { connection } from "next/server";
import { deleteAssistantEntry } from "@/lib/assistantLog";

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/assistant-log/[id]">
) {
  await connection();
  const { id } = await params;

  const deleted = await deleteAssistantEntry(id);
  if (!deleted) {
    return NextResponse.json({ error: "Log entry not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
