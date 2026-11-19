import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import QAList from "@/components/QAList";
import type { QAEntry } from "@/lib/qa";

export const metadata: Metadata = {
  title: "Q&A",
  description: "Questions and answers about my background and work.",
};

export default function QAPage() {
  return (
    <main className="container page">
      <h1>Q&amp;A</h1>
      <p className="lead">
        Questions and answers about my background — loaded live from the{" "}
        <code>GET /api/qa</code> endpoint. Click a question to see the answer.
      </p>
      <Suspense fallback={<p className="lead">Loading Q&amp;A...</p>}>
        <QASection />
      </Suspense>
    </main>
  );
}

async function QASection() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.")
    ? "http"
    : "https";

  const response = await fetch(`${protocol}://${host}/api/qa`, {
    cache: "no-store",
  });
  const entries: QAEntry[] = response.ok ? await response.json() : [];

  return <QAList entries={entries} />;
}
