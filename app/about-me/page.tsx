import type { Metadata } from "next";
import Image from "next/image";
import aboutPhoto from "../../public/images/about-me.jpg";

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
            I am a student at Santa Clara University studying information
            systems. I like building things end to end — from Python analytics
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
          coursework in full-stack web development, databases, and data
          analytics.
        </p>
      </section>
    </main>
  );
}
