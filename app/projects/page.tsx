import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import type { ComponentProps } from "react";
import ProjectCard from "@/components/ProjectCard";

export const metadata: Metadata = {
  title: "My Projects",
  description: "A selection of projects I have built.",
};

export default function ProjectsPage() {
  return (
    <main className="container page">
      <h1>My Projects</h1>
      <p className="lead">
        Each project has its own dynamically routed page. Click a card to
        explore it — loaded live from the <code>GET /api/projects</code>{" "}
        endpoint.
      </p>
      <Suspense fallback={<p className="lead">Loading projects...</p>}>
        <ProjectsGrid />
      </Suspense>
    </main>
  );
}

async function ProjectsGrid() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.")
    ? "http"
    : "https";

  const response = await fetch(`${protocol}://${host}/api/projects`, {
    cache: "no-store",
  });
  const projects: ProjectCardData[] = response.ok ? await response.json() : [];

  if (projects.length === 0) {
    return (
      <p className="banner success">
        No projects yet — check back soon, or add one from the admin page.
      </p>
    );
  }

  return (
    <div className="grid">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}

type ProjectCardData = ComponentProps<typeof ProjectCard>["project"];
