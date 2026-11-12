# Personal Portfolio — Next.js

A portfolio website for ISBA 2438 built with **Next.js (App Router)**, **TypeScript**, and **Server Actions**.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page with hero and quick links |
| `/about-me` | About Me — bio, skills, education |
| `/contact-me` | Contact form that makes a client-side **API call** to `POST /api/contact` — shows per-field errors from the server |
| `/contact-me-server-form` | Contact form handled by a **Server Action**; submissions are saved to `data/submissions.json` |
| `/projects` | Lists all projects |
| `/projects/[slug]` | **Dynamically routed** project detail pages — currently `/projects/task-manager-app` and `/projects/weather-dashboard`. Each project page also embeds a contact form tagged with that project's slug. |

## How the Contact Form Works (`/contact-me-server-form`)

The whole flow runs on the server with **no client-side JavaScript required** (progressive enhancement):

1. **Render** — `app/contact-me-server-form/page.tsx` is a Server Component that renders the `<ContactForm />` client component. The form's `action` prop receives the Server Action `saveContactMessage` (from `app/contact-me-server-form/actions.ts`, marked `"use server"`) through React's `useActionState` hook, and `noValidate` disables browser validation so the server rules are what users see.
2. **Submit** — Clicking "Send Message" POSTs the form; Next.js invokes the `saveContactMessage` Server Action on the server with the `FormData`.
3. **Validate** — The action calls the shared `validateContact` from `lib/validation.ts`. On failure it *returns* state (per-field errors plus the submitted values) instead of redirecting — so the form shows inline error messages under each field and keeps what the user typed.
4. **Persist** — On valid input the action calls the shared `addContact` from `lib/contacts.ts`, which appends to `data/submissions.json` (id, fields, optional project tag, timestamp).
5. **Feedback** — The action returns success state with the saved id; the form shows the green banner and clears the fields. Because the banner comes from per-submission state (not the URL), it only appears for the submission that actually succeeded.
6. **Shared path** — The same `validateContact` and `addContact` power the `POST /api/contact` endpoint used by `/contact-me`, so both forms validate identically and save to the same JSON file.

Submitted data lives in [`data/submissions.json`](data/submissions.json).

### Shared Validation and Storage (`lib/`)

Both submission paths — the Server Action form and the API endpoint — share one validation and one storage implementation (no duplicate logic):

- [`lib/validation.ts`](lib/validation.ts) — `validateContact({ name, email, message })` returns `{ valid, errors }` with per-field messages. Rules: name/message required after trimming; email must have exactly one `@`, non-empty local part, no whitespace, and a domain containing a dot with no empty labels.
- [`lib/contacts.ts`](lib/contacts.ts) — `readContacts()` and `addContact()` read and append to `data/submissions.json`, creating it if missing.

### API Endpoint: `POST /api/contact`

A JSON API that saves to the same file:

1. Parses the JSON request body.
2. Validates it with `validateContact` — invalid requests get `400 { errors }` with per-field messages.
3. Valid requests are saved with `addContact` and return `201 { success: true }`.

Example:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Mike","email":"mike@scu.edu","message":"Hello"}'
```

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech

- Next.js 16 (App Router, Cache Components, Server Actions)
- React 19
- TypeScript
- Plain CSS (no UI libraries)
