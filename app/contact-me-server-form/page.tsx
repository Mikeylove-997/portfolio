import type { Metadata } from "next";
import ContactForm from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact Me",
  description:
    "Send me a message. Submissions are handled by a Next.js Server Action and saved to a JSON file on the server.",
};

export default function ContactPage() {
  return (
    <main className="container page">
      <h1>Contact Me</h1>
      <p className="lead">
        Have a question or want to work together? Send me a message. This form
        is powered by a <strong>Server Action</strong> — submissions are
        validated and saved to a JSON file on the server.
      </p>
      <div className="card form-card">
        <ContactForm />
      </div>
    </main>
  );
}
