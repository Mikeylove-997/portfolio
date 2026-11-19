import { NextResponse } from "next/server";
import { connection } from "next/server";
import { addQA, getAllQA, validateQAInput } from "@/lib/qa";

export async function GET(request: Request) {
  await connection();

  const category = new URL(request.url).searchParams.get("category");
  const entries = await getAllQA();

  if (category) {
    const filtered = entries.filter(
      (entry) => entry.category.toLowerCase() === category.toLowerCase()
    );
    return NextResponse.json(filtered);
  }

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
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

  const entry = await addQA(input);
  return NextResponse.json(entry, { status: 201 });
}
