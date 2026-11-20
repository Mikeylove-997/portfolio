import type { Metadata } from "next";
import Link from "next/link";
import AdminPageHeader from "@/components/AdminPageHeader";
import AssistantLogList from "@/components/AssistantLogList";

export const metadata: Metadata = {
  title: "Admin — Assistant Log",
  robots: { index: false },
};

export default function AssistantLogPage() {
  return (
    <main className="container page">
      <AdminPageHeader
        title="Assistant Question Log"
        lead={
          <>
            Every question visitors asked Mike Zhao Assistant, newest first —
            stored locally in <code>data/assistant-log.jsonl</code>{" "}
            (gitignored, never committed). Review what people ask that the bot
            can&apos;t answer yet, then add those topics to{" "}
            <code>data/background.md</code>. Deleting an entry asks for
            confirmation first.
          </>
        }
        backHref="/admin"
      />
      <AssistantLogList />
      <div className="cta-row">
        <Link href="/admin" className="btn secondary">
          ← Contact Submissions
        </Link>
      </div>
    </main>
  );
}
