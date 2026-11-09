import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "@/components/contact-form";
import FormBanner from "@/components/form-banner";

export const metadata: Metadata = {
  title: "Contact Me",
  description:
    "Send me a message. Submissions are handled by a Next.js Server Action and saved to a JSON file on the server.",
};

export default function ContactPage(
  props: PageProps<"/contact-me-server-form">
) {
  return (
    <main className="container page">
      <h1>Contact Me</h1>
      <p className="lead">
        Have a question or want to work together? Send me a message. This form
        is powered by a <strong>Server Action</strong> — submissions are
        validated and saved to a JSON file on the server.
      </p>
      <Suspense fallback={null}>
        <FormBanner searchParams={props.searchParams} />
      </Suspense>
      <div className="card form-card">
        <ContactForm />
      </div>
    </main>
  );
}
