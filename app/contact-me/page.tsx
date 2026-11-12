"use client";

import { useState } from "react";

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export default function ContactApiPage() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setFailed(false);

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 201) {
        setErrors({});
        setSubmitted(true);
        form.reset();
      } else if (response.status === 400) {
        const data = await response.json();
        setErrors(data.errors ?? {});
        setSubmitted(false);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="container page">
      <h1>Contact Me (API)</h1>
      <p className="lead">
        This form sends your message as a JSON request to the{" "}
        <code>POST /api/contact</code> endpoint, which validates it and saves
        it to the same JSON file as the Server Action form.
      </p>

      {submitted ? (
        <p className="banner success" role="status">
          Thanks! Your message was saved successfully.
        </p>
      ) : null}
      {failed ? (
        <p className="banner error" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}

      <div className="card form-card">
        <form onSubmit={handleSubmit} className="form" noValidate>
          <div className="field">
            <label htmlFor="api-name">Name</label>
            <input
              id="api-name"
              name="name"
              type="text"
              placeholder="Jane Doe"
            />
            {errors.name ? <p className="field-error">{errors.name}</p> : null}
          </div>
          <div className="field">
            <label htmlFor="api-email">Email</label>
            <input
              id="api-email"
              name="email"
              type="email"
              placeholder="jane@example.com"
            />
            {errors.email ? (
              <p className="field-error">{errors.email}</p>
            ) : null}
          </div>
          <div className="field">
            <label htmlFor="api-message">Message</label>
            <textarea
              id="api-message"
              name="message"
              rows={5}
              placeholder="Tell me about your project or question..."
            />
            {errors.message ? (
              <p className="field-error">{errors.message}</p>
            ) : null}
          </div>
          <button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </main>
  );
}
