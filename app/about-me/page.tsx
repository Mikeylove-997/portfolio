import type { Metadata } from "next";
import Image from "next/image";
import { headers } from "next/headers";
import { Suspense } from "react";
import aboutPhoto from "../../public/images/about-me.jpg";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import type { Experience } from "@/lib/experience";

export const metadata: Metadata = {
  title: "About Me",
  description: "Who I am, what I study, and the skills I bring.",
};

const skills = [
  "Python",
  "R",
  "SQL",
  "TypeScript",
  "React",
  "Next.js",
  "Tableau",
  "Git",
];

export default function AboutPage() {
  return (
    <main className="container page">
      <h1>About Me</h1>
      <section className="card about-header">
        <Image
          src={aboutPhoto}
          alt="Mike Zhao"
          className="about-photo"
          width={240}
          height={240}
          priority
        />
        <div>
          <h2>Hi, I&apos;m Mike Zhao</h2>
          <p>
            I am a student at Santa Clara University pursuing an MS in
            Business Analytics (MSBA). I like building things end to end —
            from Python analytics
            and machine learning projects to web applications with Next.js.
          </p>
          <p>
            My work spans data science (predictive models, prescriptive
            analytics, Tableau dashboards) and software development (CLI tools,
            REST APIs). This portfolio itself is an example: it uses Next.js
            dynamic routes for projects and a Server Action that saves contact
            form submissions to a JSON file.
          </p>
        </div>
      </section>
      <Suspense fallback={<p className="lead">Loading experience...</p>}>
        <ExperienceSection />
      </Suspense>
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
          <strong>Santa Clara University</strong> — MS in Business Analytics
          (MSBA), expected December 2026.
        </p>
        <p>
          <strong>University of Toronto</strong> — Bachelor of Arts in
          Economics and Political Science, Sep 2016 – Jun 2021.
        </p>
      </section>
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

  return (
    <section>
      <h2>Experience</h2>
      <ExperienceTimeline entries={entries} />
    </section>
  );
}
