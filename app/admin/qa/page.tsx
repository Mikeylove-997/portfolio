import type { Metadata } from "next";
import Link from "next/link";
import QAManager from "@/components/QAManager";

export const metadata: Metadata = {
  title: "Admin — Q&A",
  robots: { index: false },
};

export default function AdminQAPage() {
  return (
    <main className="container page">
      <Link href="/admin" className="back-link">
        ← Admin
      </Link>
      <h1>Q&amp;A Knowledge Base</h1>
      <p className="lead">
        These entries power the public <code>/qa</code> page — and later, a
        chatbot that answers visitor questions from this knowledge base.
        Creating sends <code>POST /api/qa</code>; editing uses{" "}
        <code>PUT /api/qa/[id]</code>; deleting asks for confirmation first.
      </p>
      <QAManager />
    </main>
  );
}
