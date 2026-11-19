import { NextResponse } from "next/server";
import {
  CONTACT_STATUSES,
  deleteContact,
  getContactById,
  updateContactStatus,
} from "@/lib/contacts";
import type { ContactStatus } from "@/lib/contacts";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/contact/[id]">
) {
  const { id } = await params;
  const submission = await getContactById(id);

  if (!submission) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(submission);
}

export async function PATCH(
  request: Request,
  { params }: RouteContext<"/api/contact/[id]">
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { status } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof status !== "string" ||
    !CONTACT_STATUSES.includes(status as ContactStatus)
  ) {
    return NextResponse.json(
      {
        error:
          'Invalid status. Allowed values: "new", "read", "replied".',
      },
      { status: 400 }
    );
  }

  const updated = await updateContactStatus(id, status as ContactStatus);

  if (!updated) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/contact/[id]">
) {
  const { id } = await params;
  const deleted = await deleteContact(id);

  if (!deleted) {
    return NextResponse.json(
      { error: "Submission not found." },
      { status: 404 }
    );
  }

  return new NextResponse(null, { status: 204 });
}
