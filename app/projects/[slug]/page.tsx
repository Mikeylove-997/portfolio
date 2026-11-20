import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import ContactForm from "@/components/contact-form";
import TechTags from "@/components/TechTags";
import type { Project } from "@/components/ProjectCard";

export default function ProjectPage(props: PageProps<"/projects/[slug]">) {
  return (
    <main className="container page">
      <Suspense fallback={<p className="lead">Loading project...</p>}>
        <ProjectContent params={props.params} />
      </Suspense>
    </main>
  );
}

async function ProjectContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.")
    ? "http"
    : "https";

  const response = await fetch(
    `${protocol}://${host}/api/projects/${slug}`,
    { cache: "no-store" }
  );
  const project: Project | null = response.ok ? await response.json() : null;

  if (!project) {
    notFound();
  }

  return (
    <article>
      <Link href="/projects" className="back-link">
        ← All Projects
      </Link>
      <h1>{project.title}</h1>
      <p className="lead">{project.description}</p>
      <div className="cta-row">
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn primary"
          >
            View Live App
          </a>
        ) : null}
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn secondary"
        >
          View Source on GitHub
        </a>
      </div>

      <section className="card">
        <h2>Tech Stack</h2>
        <TechTags tags={project.techStack} />
      </section>

      <section className="card">
        <h2>Key Features</h2>
        <ul className="feature-list">
          {project.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Contact Me About This Project</h2>
        <p>
          Interested in something similar? Send me a message — it will be
          tagged with this project.
        </p>
        <ContactForm projectSlug={project.slug} />
      </section>
    </article>
  );
}
