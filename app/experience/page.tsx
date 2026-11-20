import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import type { Experience } from "@/lib/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: "My employment history — roles, highlights, and skills.",
};

export default function ExperiencePage() {
  return (
    <main className="container page">
      <h1>Experience</h1>
      <p className="lead">
        My employment history — loaded live from the{" "}
        <code>GET /api/experience</code> endpoint, newest first with current
        roles at the top.
      </p>
      <Suspense fallback={<p className="lead">Loading experience...</p>}>
        <ExperienceSection />
      </Suspense>
    </main>
  );
}

async function ExperienceSection() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.")
    ? "http"
    : "https";

  const response = await fetch(`${protocol}://${host}/api/experience`, {
    cache: "no-store",
  });
  const entries: Experience[] = response.ok ? await response.json() : [];

  return <ExperienceTimeline entries={entries} />;
}
