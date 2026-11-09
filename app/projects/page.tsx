import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/projects";

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
        explore it.
      </p>
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
    </main>
  );
}
