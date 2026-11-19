import { NextResponse } from "next/server";
import { connection } from "next/server";
import { answerQuestion, getAllPieces, getTopPieces } from "@/lib/assistant";
import type { ContextPiece } from "@/lib/assistant";
import { askGemini } from "@/lib/gemini";
import { logAssistantEntry } from "@/lib/assistantLog";

const QUESTION_MAX_LENGTH = 300;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const CONTEXT_CHAR_LIMIT = 60_000;

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

function totalChars(pieces: ContextPiece[]): number {
  return pieces.reduce(
    (total, piece) => total + piece.content.length + piece.source.label.length,
    0
  );
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

  const allPieces = await getAllPieces();
  let context: ContextPiece[];
  if (totalChars(allPieces) > CONTEXT_CHAR_LIMIT) {
    context = await getTopPieces(trimmed, 10);
  } else {
    context = allPieces;
  }

  let payload: Record<string, unknown>;
  let loggedSources: string[];

  const geminiResult = context.length > 0 ? await askGemini(trimmed, context) : null;

  if (geminiResult) {
    const usedSources = context
      .filter((_, index) => geminiResult.usedSources.includes(index + 1))
      .map((piece) => piece.source);

    payload = {
      answer: geminiResult.answer,
      matched: usedSources.length > 0,
      source: usedSources[0] ?? null,
      sources: usedSources,
      related: [],
      mode: "ai",
    };
    loggedSources = usedSources.map((source) => source.label);
  } else {
    const keyword = await answerQuestion(trimmed);
    payload = {
      ...keyword,
      sources: keyword.source ? [keyword.source] : [],
      mode: "keyword",
    };
    loggedSources = keyword.source ? [keyword.source.label] : [];
  }

  try {
    await logAssistantEntry({
      timestamp: new Date().toISOString(),
      question: trimmed,
      mode: (payload.mode as "ai" | "keyword") ?? "keyword",
      matched: Boolean(payload.matched),
      sources: loggedSources,
    });
  } catch {
    // logging must never break an answer
  }

  return NextResponse.json(payload);
}
