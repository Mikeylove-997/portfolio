import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { readContacts } from "@/lib/contacts";
import type { ContactSubmission } from "@/lib/contacts";

export const metadata: Metadata = {
  title: "Admin",
  description: "All contact form submissions.",
  robots: { index: false },
};

export default function AdminPage() {
  return (
    <main className="container page">
      <h1>Admin — Contact Submissions</h1>
      <p className="lead">
        Every submission from both forms, newest first. Data is read fresh on
        each request.
      </p>
      <Suspense fallback={<p className="lead">Loading submissions...</p>}>
        <SubmissionsTable />
      </Suspense>
      <div className="cta-row">
        <Link href="/admin/blogs" className="btn secondary">
          Manage Blog Posts →
        </Link>
      </div>
    </main>
  );
}

async function SubmissionsTable() {
  await connection();

  const contacts = await readContacts();
  const sorted = [...contacts].sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  if (sorted.length === 0) {
    return <p className="banner success">No submissions yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Submitted</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((submission) => (
            <SubmissionRow key={submission.id} submission={submission} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SubmissionRow({
  submission,
}: {
  submission: ContactSubmission;
}) {
  const sourceLabel =
    submission.source === "api"
      ? "API"
      : submission.source === "server-action"
        ? "Server Action"
        : "Unknown";

  const submitted = new Date(submission.submittedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Los_Angeles",
  });

  return (
    <tr>
      <td>{submission.name}</td>
      <td>{submission.email}</td>
      <td className="message-cell">{submission.message}</td>
      <td>{submitted}</td>
      <td>{sourceLabel}</td>
    </tr>
  );
}
