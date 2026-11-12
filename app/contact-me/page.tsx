import type { Metadata } from "next";
import ApiContactForm from "@/components/ApiContactForm";

export const metadata: Metadata = {
  title: "Contact Me (API)",
};

export default function ContactApiPage() {
  return (
    <main className="container page">
      <h1>Contact Me (API)</h1>
      <p className="lead">
        This form sends your message as a JSON request to the{" "}
        <code>POST /api/contact</code> endpoint, which validates it and saves
        it to the same JSON file as the Server Action form.
      </p>
      <ApiContactForm />
    </main>
  );
}
