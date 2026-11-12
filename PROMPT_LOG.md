# Prompt Log & Critique — Assignment 2, Part 2

**Student:** Mike Zhao · **Assignment ID:** assignment-2 · **Rubric:** 1.0.0
**Coding agent:** Viber · **Reviewer:** I tested each step manually in the browser; Claude acted as a second reviewer during testing.

> **How these prompts were written:** I used Claude as a reviewer/supervisor. Claude drafted the prompt wording from the handout and from bugs we found while testing; I read each one, made sure I understood it, and sent it to Viber. Viber wrote all of the code.
>
> DRAFT NOTE (delete before submitting): check each prompt matches what I actually sent, and rewrite the critique in my own words.

---

## Part 2 scope and decisions

- Built `/contact-me`, which POSTs to **`/api/contact`**. The handout mentions both `/api/contacts` and `/api/contact`; I chose the singular `/api/contact` and used it everywhere.
- Both contact forms (Part 1 Server Action form and the new API form) save to **one file**, `data/submissions.json`, as line 5 of the handout requires.
- `/admin` lists all contact entries. Blog features (`/admin/blogs`, `/api/blogs`, `/blogs`, `/blogs/[slug]`) were added to cover the blog version of the Part 2 handout.

---

## Prompt log

| # | Goal | Prompt (from Viber) | Resulting change | Commit |
|---|------|---------------------|------------------|--------|
| 1 | Contact API + shared helpers | "Context: This is my Next.js (App Router) portfolio from Part 1. The page /contact-me-server-form saves submissions to a JSON file using a Server Action. For Part 2 I need a new API endpoint that saves to the SAME JSON file. First, inspect the existing Server Action… Create lib/validation.ts… lib/contacts.ts… refactor the Server Action… create app/api/contact/route.ts with a POST handler… Reason: the rubric requires server-side validation and no duplicate logic… Don't build any UI yet." *(full prompt in Viber history)* | Inspected the existing Server Action; created `lib/validation.ts` (name/message/email rules) and `lib/contacts.ts` (read/append JSON); refactored the Server Action to use them; added `app/api/contact/route.ts` (POST → 400 with field errors or 201). | `c6bcf70` |
| 2 | `/contact-me` page | "Context: app/api/contact/route.ts and lib/validation.ts now exist. Now build the UI for the API-based contact form. Create components/ContactForm.tsx as a client component with labeled name, email and message fields… POST JSON to /api/contact… handle 201 / 400 / network error… Add Contact to the nav." *(full prompt in Viber history)* | Client form component with labeled fields that `fetch`es `/api/contact`; separate success, field-error, and request-failure states; added "Contact" to the nav. | `4a72aad` |
| 3 | Fix Server Action form feedback | "Bug in /contact-me-server-form: when I submit an invalid email like test@nodot, the server rejects it (URL becomes ?status=error) but the page shows no error message and clears all fields… Fix it so it behaves like /contact-me: per-field errors from lib/validation.ts, keep typed input, success banner only for a real success, noValidate. Use useActionState… Explain the cause before making changes." *(full prompt in Viber history)* | Switched to `useActionState`; per-field errors from the shared validator; input kept on failure; success banner only for the current submission; `noValidate` so server validation is what users see. | `652c153` |
| 4 | `/admin` contact viewer | "Create an /admin page that shows every contact submission in a table: name, email, message, submitted date, and which form it came from (API vs Server Action), newest first. Read the data with readContacts() from lib/contacts.ts… mark the page dynamic… If submissions don't record which form they came from, add a source field in both save paths." *(full prompt in Viber history)* | Table of all submissions (name, email, message, date, source), newest first; added a `source` field (`api` / `server-action`) to both save paths. | `3e4ee89` |
| 5 | Blog data + API | "Context: The contact feature is done. Now add blog posts stored in a JSON file, following the same pattern as lib/contacts.ts. Create data/blogs.json with 2 seed posts… lib/blogs.ts with getAllBlogs, getBlogBySlug, addBlog… app/api/blogs/route.ts with GET and POST (400 on blank fields, 409 on duplicate slug)… No UI yet." *(full prompt in Viber history)* | `data/blogs.json` with 2 seed posts; `lib/blogs.ts`; `app/api/blogs/route.ts` with GET (all posts) and POST (validation, slug from title, 409 on duplicate). A follow-up commit removed a test post left in the seeds. | `21cce63`, `3b5a291` |
| 6 | Blog pages | "Context: /api/blogs (GET/POST) and lib/blogs.ts exist… Now build the visible blog pages: /blogs list loaded from GET /api/blogs; /blogs/[slug] with notFound() and a not-found page; components/BlogForm.tsx + /admin/blogs that POSTs to /api/blogs with success / 400 / 409 / error states; add Blogs to the nav and a link from /admin to /admin/blogs." *(full prompt in Viber history)* | `/blogs` list loaded from `GET /api/blogs`; `/blogs/[slug]` detail with a "Post not found" page; `/admin/blogs` form (`BlogForm`) that POSTs to `/api/blogs`; "Blogs" in the nav and a link from `/admin`. | `2bb528b` |
| 7 | Fix false error on publish | "Bug in components/BlogForm.tsx: publishing a valid post saves it (network tab shows 201 Created) but the page shows 'Something went wrong.' Cause: event.currentTarget.reset() runs after an await, when currentTarget is null… Fix: store const form = event.currentTarget at the start and call form.reset(). Check whether ContactForm has the same issue. Change nothing else." | Stored the form reference before `await` instead of using `event.currentTarget` afterwards; same fix applied to the API contact form. | `5235190` |
| 8 | Remove personal data | "Replace data/submissions.json with 2 fictional sample entries (e.g. jane@example.com, alex@example.com), one with source 'api' and one with 'server-action', and keep the same fields. My real email must not be in the repo. Commit and push." | Replaced `data/submissions.json` with two fictional entries; removed my personal email from the repository. | `df9143f` |

---

## Critique of generated code

### Example 1 — Server Action form rejected input silently
- **File / commit:** `/contact-me-server-form` Server Action form · fix in `652c153`
- **Agent proposal:** On invalid input the form redirected to `?status=error` but showed no message, cleared the fields, and could leave an old green success banner visible.
- **My decision:** Kept the shared server validation; asked for per-field errors with `useActionState`, preserved input, a state-driven success banner, and `noValidate`.
- **Reason:** The rubric requires the interface to clearly distinguish success from validation failure; a silent rejection looks like a broken form.
- **Check & actual outcome:** Submitted a blank name and `test@nodot`. Before: no message and empty fields. After: banner "Please fix the errors below", "Name is required." and "Email domain must contain a dot." under the fields, email and message preserved. A valid submission still showed the success banner.

### Example 2 — Publishing a post showed "Something went wrong"
- **File / commit:** `components/BlogForm.tsx` · introduced in `2bb528b`, fixed in `5235190`
- **Agent proposal:** The form handled 201/400/409 responses, but called `event.currentTarget.reset()` after an `await`. React had already cleared `currentTarget`, so the reset threw and the code fell into the error branch.
- **My decision:** Kept the response handling; changed it to save `const form = event.currentTarget` before the request and call `form.reset()`. Asked the agent to check the contact form for the same pattern.
- **Reason:** The post was saved (network tab showed **201 Created**) but the user was told it failed, which would lead to duplicate posts.
- **Check & actual outcome:** Before: "Something went wrong" while the post appeared on `/blogs`. After: "Post published! View … →", form cleared, post listed on `/blogs`. Re-submitting the same title showed the duplicate (409) message.

### Example 3 — Agent committed my personal test data
- **File / commit:** `data/submissions.json` · cleaned in `df9143f`
- **Agent proposal:** While committing the blog API, the agent included the contacts JSON file, which held a test submission containing my personal email, in a public repository.
- **My decision:** Kept the blog code; replaced the file with two fictional sample entries (one `api`, one `server-action`) so `/admin` still has demo data.
- **Reason:** The repository is public; app-written data files should not carry real personal information into source control.
- **Check & actual outcome:** Searched the repository history for the email (`git log --all -S`): no results. `/admin` shows the two sample rows.
