"use client";

import type { Experience } from "@/lib/experience";
import { formatExperienceDates } from "@/lib/experience-shared";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

export default function ExperienceAdminList({
  entries,
  loading,
  onEdit,
  onDelete,
}: {
  entries: Experience[];
  loading: boolean;
  onEdit: (entry: Experience) => void;
  onDelete: (entry: Experience) => void;
}) {
  return (
    <>
      <h2 className="admin-list-heading">Existing Roles</h2>
      {loading ? (
        <p className="muted">Loading roles...</p>
      ) : entries.length === 0 ? (
        <p className="muted">
          No roles yet. Use the form above to create one.
        </p>
      ) : (
        <div className="card blog-list-card">
          {entries.map((entry) => (
            <div key={entry.id} className="blog-row">
              <div>
                <span className="view-link">
                  {entry.title || entry.company}
                </span>
                <p className="post-date">
                  {entry.company} · {entry.industry} ·{" "}
                  {formatExperienceDates(entry)}
                </p>
              </div>
              <div className="row-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => onEdit(entry)}
                >
                  Edit
                </button>
                <ConfirmDeleteButton
                  confirmMessage={`Delete this role at ${entry.company}?`}
                  onConfirmed={() => onDelete(entry)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
