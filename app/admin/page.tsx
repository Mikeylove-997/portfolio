import type { Metadata } from "next";
import Link from "next/link";
import SubmissionsTable from "@/components/SubmissionsTable";

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
        Every submission from both forms, newest first, loaded live from the{" "}
        <code>GET /api/contact</code> endpoint. Change a status with the
        dropdown (saved via <code>PATCH</code>); deleting asks for
        confirmation first.
      </p>
      <SubmissionsTable />
      <div className="cta-row">
        <Link href="/admin/blogs" className="btn secondary">
          Manage Blog Posts →
        </Link>
        <Link href="/admin/projects" className="btn secondary">
          Manage Projects →
        </Link>
        <Link href="/admin/qa" className="btn secondary">
          Manage Q&A →
        </Link>
        <Link href="/admin/assistant-log" className="btn secondary">
          Assistant Log →
        </Link>
      </div>
    </main>
  );
}
