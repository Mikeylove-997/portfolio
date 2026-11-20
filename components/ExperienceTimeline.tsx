import type { Experience } from "@/lib/experience";
import ExperienceCard from "@/components/ExperienceCard";

export default function ExperienceTimeline({
  entries,
}: {
  entries: Experience[];
}) {
  const dated = entries.filter((entry) => entry.startDate !== "");

  if (dated.length === 0) {
    return (
      <p className="banner success">
        Experience coming soon — check back shortly.
      </p>
    );
  }

  return (
    <div className="experience-timeline">
      {dated.map((entry) => (
        <ExperienceCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
