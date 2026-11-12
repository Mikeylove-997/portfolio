import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validation";
import { addContact } from "@/lib/contacts";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errors: { message: "Request body must be valid JSON." } },
      { status: 400 }
    );
  }

  const { name, email, message } = (body ?? {}) as Record<string, unknown>;

  const input = {
    name: typeof name === "string" ? name : "",
    email: typeof email === "string" ? email : "",
    message: typeof message === "string" ? message : "",
  };

  const { valid, errors } = validateContact(input);

  if (!valid) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  await addContact({
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    project: null,
    source: "api",
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
