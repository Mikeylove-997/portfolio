import TechTags from "@/components/TechTags";
import { formatExperienceDates } from "@/lib/experience";
import type { Experience } from "@/lib/experience";

export default function ExperienceCard({ entry }: { entry: Experience }) {
  return (
    <article className="card experience-card">
      <p className="post-date">{formatExperienceDates(entry)}</p>
      <h3>
        {entry.title ? `${entry.title}` : entry.company}
        {entry.title ? ` — ${entry.company}` : ""}
      </h3>
      <p className="experience-meta">
        {[entry.location, entry.industry].filter(Boolean).join(" · ")}
      </p>
      {entry.highlights.length > 0 ? (
        <ul className="feature-list">
          {entry.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : null}
      {entry.skills.length > 0 ? <TechTags tags={entry.skills} /> : null}
    </article>
  );
}
