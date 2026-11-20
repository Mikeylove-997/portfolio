import Link from "next/link";
import TechTags from "@/components/TechTags";

export type Project = {
  slug: string;
  title: string;
  description: string;
  techStack: string[];
  features: string[];
  repoUrl: string;
  liveUrl?: string;
};

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="card project-card"
    >
      <h2>{project.title}</h2>
      <p>{project.description}</p>
      <TechTags tags={project.techStack} />
      <span className="view-link">View project →</span>
    </Link>
  );
}
