import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";
import { getAssistantLog } from "@/lib/assistantLog";

export const metadata: Metadata = {
  title: "Admin — Assistant Log",
  robots: { index: false },
};

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AssistantLogPage() {
  return (
    <main className="container page">
      <Link href="/admin" className="back-link">
        ← Admin
      </Link>
      <h1>Assistant Question Log</h1>
      <p className="lead">
        Every question visitors asked Mike Zhao Assistant, newest first —
        stored locally in <code>data/assistant-log.jsonl</code> (gitignored,
        never committed). Review what people ask that the bot can&apos;t
        answer yet, then add those topics to{" "}
        <code>data/background.md</code>.
      </p>
      <Suspense fallback={<p className="page-loading">Loading…</p>}>
        <LogTable />
      </Suspense>
      <div className="cta-row">
        <Link href="/admin" className="btn secondary">
          ← Contact Submissions
        </Link>
      </div>
    </main>
  );
}

async function LogTable() {
  await headers();
  const entries = await getAssistantLog();

  if (entries.length === 0) {
    return (
      <p className="empty-state">
        No questions logged yet. Ask the assistant something on any public
        page and refresh here.
      </p>
    );
  }

  return (
    <div className="log-list">
      {entries.map((entry, index) => (
        <div key={entry.timestamp + index} className="blog-row log-row">
          <div className="log-main">
            <p className="log-question">{entry.question}</p>
            <p className="log-meta">
              {formatTimestamp(entry.timestamp)} · {entry.sources.length > 0 ? entry.sources.join(" · ") : "no source"}
            </p>
          </div>
          <div className="log-badges">
            <span className={`badge ${entry.mode}`}>{entry.mode}</span>
            <span className={`badge ${entry.matched ? "matched" : "unmatched"}`}>
              {entry.matched ? "answered" : "couldn't answer"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
