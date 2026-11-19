import type { QAEntry } from "@/lib/qa";

export default function QACard({ entry }: { entry: QAEntry }) {
  return (
    <details className="card qa-card">
      <summary className="qa-question">{entry.question}</summary>
      <div className="qa-answer">
        <p>{entry.answer}</p>
        {entry.keywords.length > 0 ? (
          <ul className="pill-list">
            {entry.keywords.map((keyword) => (
              <li key={keyword} className="pill">
                {keyword}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
