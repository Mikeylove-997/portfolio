# Personal Portfolio — Next.js

A portfolio website for ISBA 2438 built with **Next.js (App Router)**, **TypeScript**, and **Server Actions**.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page with hero and quick links |
| `/about-me` | About Me — bio, skills, education, and photo |
| `/contact-me` | Contact form that makes a client-side **API call** to `POST /api/contact` — shows per-field errors from the server |
| `/contact-me-server-form` | Contact form handled by a **Server Action**; submissions are saved to `data/submissions.json` |
| `/projects` | Lists all projects |
| `/projects/[slug]` | **Dynamically routed** project detail pages — currently `/projects/payactiv-ewa-api` and `/projects/company-brain`. Each project page also embeds a contact form tagged with that project's slug. |
| `/blogs` | Blog index — lists every post from `data/blogs.json` |
| `/blogs/[slug]` | **Dynamically routed** blog post pages; unknown slugs show a "Post not found" page |
| `/admin` | Submissions viewer — table of everything saved by both contact forms (newest first). Not linked in the nav. |
| `/admin/blogs` | Blog manager — publish new posts via `POST /api/blogs` and **delete** existing ones |
| `/admin/projects` | Project manager — **create, edit, and delete** projects via the projects API |

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

## Blog: Publishing and Deleting (`/admin/blogs`)

The admin page manages posts end to end — create and delete — against the same `data/blogs.json` file that `/blogs` reads:

- **Create** — `components/BlogForm.tsx` sends a JSON `POST /api/blogs` request. The server generates the slug from the title (`lib/blogs.ts` → `addBlog`), rejects duplicate slugs with `409`, and shows per-field errors (`400`) inline. New posts appear on `/blogs` immediately.
- **Delete** — `components/BlogList.tsx` lists existing posts (title + date) below the form. Each row's Delete button asks `Delete this post?` with a browser confirm dialog, then calls `DELETE /api/blogs/[slug]`. On success (`204`) the row is removed and a "Post deleted." message appears; if the post was already gone the API returns `404` and the list shows an error instead. Unknown slugs never crash the page.

The public blog pages and the create form are unchanged by the delete feature — it only adds a management UI on top of the same data file.

### Blog API Endpoints

| Endpoint | Purpose | Responses |
| --- | --- | --- |
| `GET /api/blogs` | List all posts | `200` JSON array |
| `POST /api/blogs` | Create a post | `201` post, `400` validation errors, `409` duplicate slug |
| `GET /api/blogs/[slug]` | Fetch one post | `200` post, `404` if missing |
| `PUT /api/blogs/[slug]` | Update a post's title/content | `200` updated, `400` validation errors, `404` if missing |
| `DELETE /api/blogs/[slug]` | Delete a post | `204` on success, `404` if the slug doesn't exist |

| Endpoint | Purpose | Responses |
| --- | --- | --- |
| `GET /api/contact` | List all submissions, newest first | `200` JSON array |
| `POST /api/contact` | Save a submission | `201` `{ success: true }`, `400` field errors |
| `GET /api/contact/[id]` | Fetch one submission | `200` submission, `404` if missing |
| `PATCH /api/contact/[id]` | Update status only (`"new"`, `"read"`, `"replied"`) | `200` updated, `400` invalid status, `404` if missing |
| `DELETE /api/contact/[id]` | Delete a submission | `204` on success, `404` if missing |

Every submission carries a `status` (`"new"`, `"read"`, or `"replied"`); new submissions default to `"new"` and older entries without one are treated as `"new"`. The admin table (`/admin`) loads through `GET /api/contact` and manages status (dropdown) and deletion (with confirmation) per row.

Storage lives in [`lib/blogs.ts`](lib/blogs.ts) (`getAllBlogs`, `getBlogBySlug`, `addBlog`, `deleteBlog`) and [`data/blogs.json`](data/blogs.json).

## Projects: Full CRUD (`data/projects.json`)

Projects are no longer hardcoded — they live in [`data/projects.json`](data/projects.json) and are served through the API:

- **Public pages** (`/projects`, `/projects/[slug]`, and the home page project count) fetch from `GET /api/projects` at request time — the same live-fetch pattern as `/blogs`.
- **Admin** (`/admin/projects`) lists every project with Edit/Delete buttons. The same form handles create (`POST`) and edit (`PUT`), pre-filled when editing; tech stack and features are entered one per line. Deleting asks for confirmation first.
- **Slugs** are generated from the title on create and kept on update, so existing links never break.
- **Validation** (server-side, `lib/projects.ts`): title, description, and repo URL are required; repo and live URLs must be valid http(s) URLs; tech stack and features must each contain at least one non-empty entry. Invalid input returns `400` with field-level errors.

| Endpoint | Purpose | Responses |
| --- | --- | --- |
| `GET /api/projects` | List all projects | `200` JSON array |
| `POST /api/projects` | Create a project | `201` project, `400` field errors, `409` duplicate slug |
| `GET /api/projects/[slug]` | Fetch one project | `200` project, `404` if missing |
| `PUT /api/projects/[slug]` | Update a project | `200` updated, `400` field errors, `404` if missing |
| `DELETE /api/projects/[slug]` | Delete a project | `204` on success, `404` if missing |

## Q&A Knowledge Base (`/qa`, `/admin/qa`)

A browsable knowledge base about my background, grouped by category (Experience, Projects, Skills, Education, Working style). Entries live in [`data/qa.json`](data/qa.json) and are served through the API:

- **Public** (`/qa`) — loads `GET /api/qa` at request time and groups entries by category; each question expands to its answer (no JavaScript needed).
- **Admin** (`/admin/qa`) — one form for create (`POST /api/qa`) and edit (`PUT /api/qa/[id]`, pre-filled); keywords are entered comma-separated; deleting asks for confirmation.
- **Validation** (server-side, `lib/qa.ts`): question and answer are required; category must be one of the allowed values; keywords is an optional list of non-empty strings.

| Endpoint | Purpose | Responses |
| --- | --- | --- |
| `GET /api/qa` | List entries (optional `?category=` filter) | `200` JSON array |
| `POST /api/qa` | Create an entry | `201` entry, `400` field errors |
| `GET /api/qa/[id]` | Fetch one entry | `200` entry, `404` if missing |
| `PUT /api/qa/[id]` | Update an entry | `200` updated, `400` field errors, `404` if missing |
| `DELETE /api/qa/[id]` | Delete an entry | `204` on success, `404` if missing |

## Mike Zhao Assistant (`/api/assistant`)

A rule-based chat widget (no external AI service) that answers visitor questions from three sources on this site — background notes (`data/background.md`, section-per-topic), projects (`data/projects.json`), and blog posts (`data/blogs.json`):

- **Widget** (`components/ChatWidget.tsx`) — floating button in the bottom-right corner on every public page (hidden on `/admin`). Matching happens in one function (`lib/assistant.ts` → `answerQuestion`): it tokenizes the question, drops filler words, and scores each source document — title matches (section titles, project titles and tech stack, blog titles) count more than matches in long text. Designed to be swapped for an AI model later.
- **Response** — the best match's answer (background section content; project title + description; blog title + excerpt) when its score clears a threshold, with `Based on: <Type> — <label>` attribution (clickable when the source has a page), up to 2 related items as clickable buttons, or a fallback pointing to the contact form.
- **History** — the conversation is saved in the browser's LocalStorage under `mz-assistant-chat` (last 50 messages, survives refresh and navigation; older messages without the newer source fields still render; broken/missing data starts an empty chat). Nothing is stored server-side.

| Endpoint | Purpose | Responses |
| --- | --- | --- |
| `POST /api/assistant` | Ask a question (`{ question: string }`, max 300 chars) | `200` `{ answer, matched, source, related }`, `400` invalid input |

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
