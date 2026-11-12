"use client";

import { useActionState } from "react";
import {
  saveContactMessage,
  type ContactFormState,
} from "@/app/contact-me-server-form/actions";

const initialContactFormState: ContactFormState = {
  status: "idle",
  errors: {},
  values: { name: "", email: "", message: "" },
  savedId: null,
};

export default function ContactForm({ projectSlug }: { projectSlug?: string }) {
  const [state, formAction, sending] = useActionState(
    saveContactMessage,
    initialContactFormState
  );

  return (
    <form
      key={state.savedId ?? "form"}
      action={formAction}
      className="form"
      noValidate
    >
      {projectSlug ? (
        <input type="hidden" name="project" value={projectSlug} />
      ) : null}
      {state.status === "success" ? (
        <p className="banner success" role="status">
          Thanks! Your message was saved successfully.
        </p>
      ) : null}
      {state.status === "error" ? (
        <p className="banner error" role="alert">
          Please fix the errors below and submit again.
        </p>
      ) : null}
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={state.values.name}
          placeholder="Jane Doe"
        />
        {state.errors.name ? <p className="field-error">{state.errors.name}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={state.values.email}
          placeholder="jane@example.com"
        />
        {state.errors.email ? (
          <p className="field-error">{state.errors.email}</p>
        ) : null}
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          defaultValue={state.values.message}
          placeholder="Tell me about your project or question..."
        />
        {state.errors.message ? (
          <p className="field-error">{state.errors.message}</p>
        ) : null}
      </div>
      <button type="submit" disabled={sending}>
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
