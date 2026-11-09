import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Me",
  description: "Who I am, what I study, and the skills I bring.",
};

const skills = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Python",
  "SQL",
  "Git",
];

export default function AboutPage() {
  return (
    <main className="container page">
      <h1>About Me</h1>
      <section className="card">
        <h2>Hi, I&apos;m Your Name</h2>
        <p>
          I am a student at Santa Clara University studying information
          systems and web development. I enjoy turning ideas into working web
          applications — from designing the interface to wiring up the server
          behind it.
        </p>
        <p>
          Lately I have been building with Next.js, exploring the App Router,
          Server Components, and Server Actions. This portfolio itself is an
          example: it uses dynamic routes for projects and a Server Action
          that saves contact form submissions to a JSON file.
        </p>
      </section>
      <section className="card">
        <h2>Skills</h2>
        <ul className="pill-list">
          {skills.map((skill) => (
            <li key={skill} className="pill">
              {skill}
            </li>
          ))}
        </ul>
      </section>
      <section className="card">
        <h2>Education</h2>
        <p>
          <strong>Santa Clara University</strong> — Information Systems,
          coursework in full-stack web development, databases, and cloud
          computing.
        </p>
      </section>
    </main>
  );
}
