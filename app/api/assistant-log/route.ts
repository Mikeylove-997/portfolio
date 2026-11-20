import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getAssistantLog } from "@/lib/assistantLog";

export async function GET() {
  await connection();
  const entries = await getAssistantLog();
  return NextResponse.json(entries);
}
