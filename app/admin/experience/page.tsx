import type { Metadata } from "next";
import ExperienceManager from "@/components/ExperienceManager";
import AdminPageHeader from "@/components/AdminPageHeader";

export const metadata: Metadata = {
  title: "Admin — Experience",
  robots: { index: false },
};

export default function AdminExperiencePage() {
  return (
    <main className="container page">
      <AdminPageHeader
        title="Experience"
        lead={
          <>
            Your employment history — the single source of job information for
            the site and the assistant. Creating sends{" "}
            <code>POST /api/experience</code>; editing uses{" "}
            <code>PUT /api/experience/[id]</code>; deleting asks for
            confirmation first. Dates use the month picker; leave the end date
            empty for current roles. Roles without a start date stay hidden
            from the public timeline.
          </>
        }
        backHref="/admin"
      />
      <ExperienceManager />
    </main>
  );
}
