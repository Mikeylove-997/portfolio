import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Suspense } from "react";

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
  const projects: Project[] = response.ok ? await response.json() : [];

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
        <Link
          key={project.slug}
          href={`/projects/${project.slug}`}
          className="card project-card"
        >
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <ul className="pill-list">
            {project.techStack.map((tech) => (
              <li key={tech} className="pill">
                {tech}
              </li>
            ))}
          </ul>
          <span className="view-link">View project →</span>
        </Link>
      ))}
    </div>
  );
}

type Project = {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  repoUrl: string;
  liveUrl?: string;
};
