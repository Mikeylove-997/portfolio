import { NextResponse } from "next/server";
import { connection } from "next/server";
import { answerQuestion, retrieveContext } from "@/lib/assistant";
import { askGemini } from "@/lib/gemini";

const QUESTION_MAX_LENGTH = 300;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT) {
    return true;
  }
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

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

  if (question.length > QUESTION_MAX_LENGTH) {
    return NextResponse.json(
      { error: "Question must be at most 300 characters." },
      { status: 400 }
    );
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many questions. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  await connection();

  const trimmed = question.trim();
  const context = await retrieveContext(trimmed, 5);

  const geminiResult = context.length > 0 ? await askGemini(trimmed, context) : null;

  if (geminiResult) {
    const usedSources = context
      .filter((_, index) => geminiResult.usedSources.includes(index + 1))
      .map((piece) => piece.source);
    const unusedSources = context
      .map((piece) => piece.source)
      .filter((source) => !usedSources.includes(source));

    return NextResponse.json({
      answer: geminiResult.answer,
      matched: usedSources.length > 0,
      source: usedSources[0] ?? null,
      sources: usedSources,
      related: usedSources.length > 0 ? unusedSources.slice(0, 2) : [],
      mode: "ai",
    });
  }

  const keyword = await answerQuestion(trimmed);
  return NextResponse.json({
    ...keyword,
    sources: keyword.source ? [keyword.source] : [],
    mode: "keyword",
  });
}
