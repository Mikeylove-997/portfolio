import type { Metadata } from "next";
import QAManager from "@/components/QAManager";
import AdminPageHeader from "@/components/AdminPageHeader";

export const metadata: Metadata = {
  title: "Admin — Q&A",
  robots: { index: false },
};

export default function AdminQAPage() {
  return (
    <main className="container page">
      <AdminPageHeader
        title="Q&A Knowledge Base"
        lead={
          <>
            These entries power the public <code>/qa</code> page — and later, a
            chatbot that answers visitor questions from this knowledge base.
            Creating sends <code>POST /api/qa</code>; editing uses{" "}
            <code>PUT /api/qa/[id]</code>; deleting asks for confirmation
            first.
          </>
        }
        backHref="/admin"
      />
      <QAManager />
    </main>
  );
}
