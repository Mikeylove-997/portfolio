"use client";

import { QA_CATEGORIES } from "@/lib/qa-categories";
import FieldError from "@/components/FieldError";
import type { QAEntry } from "@/lib/qa";
import { useState } from "react";

type FieldErrors = {
  question?: string;
  answer?: string;
  category?: string;
  keywords?: string;
};

export default function QAForm({
  editing,
  onSaved,
  onCancel,
}: {
  editing: QAEntry | null;
  onSaved: (message: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    question: editing?.question ?? "",
    answer: editing?.answer ?? "",
    category: editing?.category ?? QA_CATEGORIES[0],
    keywordsText: editing?.keywords.join(", ") ?? "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFailed(false);
    setFieldErrors({});

    const payload = {
      question: form.question,
      answer: form.answer,
      category: form.category,
      keywords: form.keywordsText
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
    };

    try {
      const response = editing
        ? await fetch(`/api/qa/${editing.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/qa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (response.status === 201 || response.status === 200) {
        onSaved(editing ? "Entry updated." : "Entry created.");
      } else if (response.status === 400) {
        const data = await response.json();
        setFieldErrors(data.errors ?? {});
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
    <div className="card form-card">
      <h2>{editing ? "Edit Entry" : "Add a New Entry"}</h2>
      {failed ? (
        <p className="banner error" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="form" noValidate>
        <div className="field">
          <label htmlFor="qa-question">Question</label>
          <input
            id="qa-question"
            name="question"
            type="text"
            placeholder="What do you study?"
            value={form.question}
            onChange={(event) =>
              setForm({ ...form, question: event.target.value })
            }
          />
          <FieldError message={fieldErrors.question} />
        </div>
        <div className="field">
          <label htmlFor="qa-answer">Answer</label>
          <textarea
            id="qa-answer"
            name="answer"
            rows={4}
            placeholder="Answer in one short paragraph."
            value={form.answer}
            onChange={(event) =>
              setForm({ ...form, answer: event.target.value })
            }
          />
          <FieldError message={fieldErrors.answer} />
        </div>
        <div className="field">
          <label htmlFor="qa-category">Category</label>
          <select
            id="qa-category"
            name="category"
            value={form.category}
            onChange={(event) =>
              setForm({ ...form, category: event.target.value as typeof form.category })
            }
          >
            {QA_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.category} />
        </div>
        <div className="field">
          <label htmlFor="qa-keywords">Keywords (comma-separated)</label>
          <input
            id="qa-keywords"
            name="keywords"
            type="text"
            placeholder="education, scu, information systems"
            value={form.keywordsText}
            onChange={(event) =>
              setForm({ ...form, keywordsText: event.target.value })
            }
          />
          <FieldError message={fieldErrors.keywords} />
        </div>
        <button type="submit" disabled={sending}>
          {sending ? "Saving..." : editing ? "Save Changes" : "Create Entry"}
        </button>
        {editing ? (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel edit
          </button>
        ) : null}
      </form>
    </div>
  );
}
