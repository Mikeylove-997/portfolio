import { QA_CATEGORIES } from "@/lib/qa-categories";
import type { QAEntry } from "@/lib/qa";
import QACard from "@/components/QACard";

export default function QAList({ entries }: { entries: QAEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="banner success">
        No Q&amp;A entries yet — check back soon.
      </p>
    );
  }

  return (
    <div>
      {QA_CATEGORIES.map((category) => {
        const grouped = entries.filter(
          (entry) => entry.category === category
        );
        if (grouped.length === 0) {
          return null;
        }
        return (
          <section key={category} className="qa-group">
            <h2>{category}</h2>
            {grouped.map((entry) => (
              <QACard key={entry.id} entry={entry} />
            ))}
          </section>
        );
      })}
    </div>
  );
}
