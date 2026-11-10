import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ContactForm from "@/components/contact-form";
import FormBanner from "@/components/form-banner";
import { getProjectBySlug, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(
  props: PageProps<"/projects/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Project Not Found" };
  }
  return { title: project.title, description: project.description };
}

export default async function ProjectPage(
  props: PageProps<"/projects/[slug]">
) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  return (
    <main className="container page">
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
        <ul className="pill-list">
          {project.techStack.map((tech) => (
            <li key={tech} className="pill">
              {tech}
            </li>
          ))}
        </ul>
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
        <Suspense fallback={null}>
          <FormBanner searchParams={props.searchParams} />
        </Suspense>
        <ContactForm projectSlug={project.slug} />
      </section>
    </main>
  );
}
