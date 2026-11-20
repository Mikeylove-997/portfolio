"use client";

import { useEffect, useState } from "react";
import ConfirmDeleteButton from "@/components/ConfirmDeleteButton";

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  project: string | null;
  source: string | null;
  status: "new" | "read" | "replied";
  submittedAt: string;
};

const STATUS_OPTIONS = ["new", "read", "replied"] as const;

export default function SubmissionsTable() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/contact", { cache: "no-store" });
        if (!res.ok) {
          setError("Could not load submissions. Please refresh the page.");
          return;
        }
        setSubmissions(await res.json());
      } catch {
        setError("Could not load submissions. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleStatusChange(id: string, status: string) {
    setError(null);
    const previous = submissions;

    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id
          ? { ...submission, status: status as ContactSubmission["status"] }
          : submission
      )
    );

    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        setSubmissions(previous);
        setError("Could not update the status. Please try again.");
      }
    } catch {
      setSubmissions(previous);
      setError("Could not update the status. Please try again.");
    }
  }

  async function handleDelete(submission: ContactSubmission) {
    setError(null);

    if (
      !window.confirm(
        `Delete this submission from ${submission.name}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/contact/${submission.id}`, {
        method: "DELETE",
      });

      if (res.status === 204 || res.status === 404) {
        setSubmissions((current) =>
          current.filter((s) => s.id !== submission.id)
        );
        return;
      }

      setError("Could not delete the submission. Please try again.");
    } catch {
      setError("Could not delete the submission. Please try again.");
    }
  }

  if (loading) {
    return <p className="lead">Loading submissions...</p>;
  }

  if (submissions.length === 0) {
    return <p className="banner success">No submissions yet.</p>;
  }

  return (
    <div>
      {error ? (
        <p className="banner error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Message</th>
              <th>Submitted</th>
              <th>Source</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>{submission.name}</td>
                <td>{submission.email}</td>
                <td className="message-cell">{submission.message}</td>
                <td>
                  {new Date(submission.submittedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "America/Los_Angeles",
                  })}
                </td>
                <td>
                  {submission.source === "api"
                    ? "API"
                    : submission.source === "server-action"
                      ? "Server Action"
                      : "Unknown"}
                </td>
                <td>
                  <select
                    className="status-select"
                    value={submission.status}
                    onChange={(event) =>
                      handleStatusChange(submission.id, event.target.value)
                    }
                    aria-label={`Status for ${submission.name}`}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <ConfirmDeleteButton
                    confirmMessage={`Delete this submission from ${submission.name}? This cannot be undone.`}
                    onConfirmed={() => handleDelete(submission)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
