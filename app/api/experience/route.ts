import { NextResponse } from "next/server";
import { connection } from "next/server";
import {
  addExperience,
  getAllExperience,
  sortExperience,
  validateExperienceInput,
} from "@/lib/experience";

export async function GET() {
  await connection();

  const entries = await getAllExperience();
  return NextResponse.json(sortExperience(entries));
}

export async function POST(request: Request) {
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

  const entry = await addExperience(input);
  return NextResponse.json(entry, { status: 201 });
}
