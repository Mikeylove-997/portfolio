# Personal Portfolio — Next.js

A portfolio website for ISBA 2438 built with **Next.js (App Router)**, **TypeScript**, and **Server Actions**.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page with hero and quick links |
| `/about-me` | About Me — bio, skills, education |
| `/contact-me-server-form` | Contact form handled by a **Server Action**; submissions are saved to `data/submissions.json` |
| `/projects` | Lists all projects |
| `/projects/[slug]` | **Dynamically routed** project detail pages — currently `/projects/task-manager-app` and `/projects/weather-dashboard`. Each project page also embeds a contact form tagged with that project's slug. |

## How the Contact Form Works (`/contact-me-server-form`)

The whole flow runs on the server with **no client-side JavaScript required** (progressive enhancement):

1. **Render** — `app/contact-me-server-form/page.tsx` is a **Server Component**. It renders the `<ContactForm />` component, passing the Server Action `saveContactMessage` (from `app/contact-me-server-form/actions.ts`, marked `"use server"`) to the form's `action` prop.
2. **Submit** — When the visitor clicks "Send Message", the browser POSTs the form data. Next.js intercepts that POST and invokes the `saveContactMessage` Server Action on the server with the `FormData`.
3. **Validate** — The action reads `name`, `email`, and `message` from the `FormData`, trims them, and validates that no field is empty and the email matches a basic pattern. Invalid input redirects back to the page with `?status=error`, which the page renders as an error banner.
4. **Persist** — The action reads `data/submissions.json` from disk with `fs.readFile`, parses it into an array, appends a new submission object (`id` from `crypto.randomUUID()`, the field values, the optional `project` slug, and a `submittedAt` ISO timestamp), then writes the array back with `fs.writeFile`.
5. **Redirect** — The action finishes with `redirect()`: back to `/contact-me-server-form?submitted=1` (or `/projects/<slug>?submitted=1` when the form was submitted from a project page).
6. **Feedback** — The page re-renders; the `<FormBanner />` component (inside a `<Suspense>` boundary, because `searchParams` is a runtime API) reads `submitted` from the URL and shows the success message.

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
