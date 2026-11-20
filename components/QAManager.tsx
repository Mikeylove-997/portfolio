"use client";

import { useEffect, useState } from "react";
import type { QAEntry } from "@/lib/qa";
import QACard from "@/components/QACard";
import QAForm from "@/components/QAForm";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

export default function QAManager() {
  const [entries, setEntries] = useState<QAEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<QAEntry | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/qa", { cache: "no-store" });
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function refresh() {
    const res = await fetch("/api/qa", { cache: "no-store" });
    if (res.ok) {
      setEntries(await res.json());
    }
  }

  function handleSaved(savedMessage: string) {
    setEditing(null);
    setMessage(savedMessage);
    refresh();
  }

  function cancelEdit() {
    setEditing(null);
    setMessage(null);
  }

  async function handleDelete(entry: QAEntry) {
    setFailed(false);
    setMessage(null);

    if (!window.confirm(`Delete this entry: "${entry.question}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/qa/${entry.id}`, { method: "DELETE" });

      if (res.status === 204) {
        setEntries((current) =>
          current.filter((item) => item.id !== entry.id)
        );
        setMessage("Entry deleted.");
        if (editing?.id === entry.id) {
          setEditing(null);
        }
        return;
      }

      if (res.status === 404) {
        setEntries((current) =>
          current.filter((item) => item.id !== entry.id)
        );
        setMessage("That entry was already deleted.");
        return;
      }

      setFailed(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div>
      {editing ? (
        <p className="banner success" role="status">
          Editing the entry below.{" "}
          <button type="button" className="view-link" onClick={cancelEdit}>
            Cancel edit
          </button>
        </p>
      ) : null}
      {message ? (
        <p className="banner success" role="status">
          {message}
        </p>
      ) : null}
      {failed ? (
        <p className="banner error" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}

      <QAForm
        key={editing?.id ?? "new"}
        editing={editing}
        onSaved={handleSaved}
        onCancel={cancelEdit}
      />

      <h2 className="admin-list-heading">Existing Entries</h2>
      {loading ? (
        <p className="muted">Loading entries...</p>
      ) : entries.length === 0 ? (
        <p className="muted">
          No entries yet. Use the form above to create one.
        </p>
      ) : (
        <div>
          {entries.map((entry) => (
            <div key={entry.id} className="blog-row">
              <QACard entry={entry} />
              <div className="row-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setEditing(entry)}
                >
                  Edit
                </button>
                <ConfirmDeleteButton
                  confirmMessage={`Delete this entry: "${entry.question}"?`}
                  onConfirmed={() => handleDelete(entry)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
