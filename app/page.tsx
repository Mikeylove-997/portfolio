import Link from "next/link";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <main className="container page hero">
      <p className="eyebrow">Welcome to my portfolio</p>
      <h1>
        Hi, I&apos;m <span className="accent">Your Name</span>
      </h1>
      <p className="lead">
        I build web applications with Next.js — clean interfaces on the
        front end, Server Actions and data persistence on the back end.
      </p>
      <div className="cta-row">
        <Link href="/projects" className="btn primary">
          View My Projects
        </Link>
        <Link href="/contact-me-server-form" className="btn secondary">
          Contact Me
        </Link>
      </div>
      <div className="grid home-grid">
        <Link href="/about-me" className="card">
          <h2>About Me</h2>
          <p>Who I am, what I study, and the skills I bring to a team.</p>
          <span className="view-link">Learn more →</span>
        </Link>
        <Link href="/projects" className="card">
          <h2>Projects</h2>
          <p>
            {projects.length} featured builds, each with its own dynamically
            routed page.
          </p>
          <span className="view-link">Browse projects →</span>
        </Link>
        <Link href="/contact-me-server-form" className="card">
          <h2>Contact</h2>
          <p>
            A server-rendered form — submissions are saved to a JSON file via
            a Server Action.
          </p>
          <span className="view-link">Say hello →</span>
        </Link>
      </div>
    </main>
  );
}
