"use client";

import { useEffect, useState } from "react";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";
import type { AssistantLogEntry } from "@/lib/assistantLog";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AssistantLogList() {
  const [entries, setEntries] = useState<AssistantLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/assistant-log", { cache: "no-store" });
        if (!res.ok) {
          setError("Could not load the log. Please refresh the page.");
          return;
        }
        setEntries(await res.json());
      } catch {
        setError("Could not load the log. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleDelete(entry: AssistantLogEntry) {
    setError(null);

    try {
      const res = await fetch(`/api/assistant-log/${entry.id}`, {
        method: "DELETE",
      });

      if (res.status === 204 || res.status === 404) {
        setEntries((current) =>
          current.filter((item) => item.id !== entry.id)
        );
        return;
      }

      setError("Could not delete the log entry. Please try again.");
    } catch {
      setError("Could not delete the log entry. Please try again.");
    }
  }

  if (loading) {
    return <p className="lead">Loading log...</p>;
  }

  if (entries.length === 0) {
    return (
      <p className="empty-state">
        No questions logged yet. Ask the assistant something on any public
        page and refresh here.
      </p>
    );
  }

  return (
    <div>
      {error ? (
        <p className="banner error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="log-list">
        {entries.map((entry) => (
          <div key={entry.id} className="blog-row log-row">
            <div className="log-main">
              <p className="log-question">{entry.question}</p>
              <p className="log-meta">
                {formatTimestamp(entry.timestamp)} ·{" "}
                {entry.sources.length > 0
                  ? entry.sources.join(" · ")
                  : "no source"}
              </p>
            </div>
            <div className="log-badges">
              <span className={`badge ${entry.mode}`}>{entry.mode}</span>
              <span
                className={`badge ${entry.matched ? "matched" : "unmatched"}`}
              >
                {entry.matched ? "answered" : "couldn't answer"}
              </span>
              <ConfirmDeleteButton
                confirmMessage="Delete this logged question?"
                onConfirmed={() => handleDelete(entry)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
