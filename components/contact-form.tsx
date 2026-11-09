import { saveContactMessage } from "@/app/contact-me-server-form/actions";

export default function ContactForm({ projectSlug }: { projectSlug?: string }) {
  return (
    <form action={saveContactMessage} className="form">
      {projectSlug ? (
        <input type="hidden" name="project" value={projectSlug} />
      ) : null}
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" required placeholder="Jane Doe" />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="jane@example.com"
        />
      </div>
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tell me about your project or question..."
        />
      </div>
      <button type="submit">Send Message</button>
    </form>
  );
}
