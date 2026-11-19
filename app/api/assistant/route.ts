import { NextResponse } from "next/server";
import { connection } from "next/server";
import { answerQuestion } from "@/lib/assistant";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { question } = (body ?? {}) as Record<string, unknown>;

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json(
      { error: "Question must be a non-empty string." },
      { status: 400 }
    );
  }

  if (question.length > 300) {
    return NextResponse.json(
      { error: "Question must be at most 300 characters." },
      { status: 400 }
    );
  }

  await connection();

  const result = await answerQuestion(question.trim());
  return NextResponse.json(result);
}
