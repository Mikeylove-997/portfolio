"use client";

import { useEffect, useState } from "react";
import type { Experience } from "@/lib/experience";
import type { Industry } from "@/lib/experience";
import ExperienceForm from "@/components/ExperienceForm";
import type {
  ExperienceFieldErrors,
  ExperienceFormState,
} from "@/components/ExperienceForm";
import ExperienceAdminList from "@/components/ExperienceAdminList";

export function toFormState(entry: Experience): ExperienceFormState {
  return {
    company: entry.company,
    title: entry.title,
    location: entry.location,
    startDateText: entry.startDate,
    endDateText: entry.endDate ?? "",
    industry: entry.industry,
    highlightsText: entry.highlights.join("\n"),
    skillsText: entry.skills.join("\n"),
  };
}

const EMPTY_FORM: ExperienceFormState = {
  company: "",
  title: "",
  location: "",
  startDateText: "",
  endDateText: "",
  industry: "Banking",
  highlightsText: "",
  skillsText: "",
};

export default function ExperienceManager() {
  const [entries, setEntries] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ExperienceFieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/experience", { cache: "no-store" });
        const data = await res.json();
        setEntries(Array.isArray(data) ? data : []);
      } catch {
        setFailed(true);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function refresh() {
    const res = await fetch("/api/experience", { cache: "no-store" });
    if (res.ok) {
      setEntries(await res.json());
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setFailed(false);
    setMessage(null);
    setFieldErrors({});

    const payload = {
      company: form.company,
      title: form.title,
      location: form.location,
      startDate: form.startDateText,
      endDate: form.endDateText || null,
      industry: form.industry,
      highlights: form.highlightsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      skills: form.skillsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    try {
      const response = editingId
        ? await fetch(`/api/experience/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/experience", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (response.status === 201 || response.status === 200) {
        await refresh();
        setForm(EMPTY_FORM);
        setEditingId(null);
        setMessage(
          editingId ? "Role updated." : "Role created."
        );
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

  function startEdit(entry: Experience) {
    setEditingId(entry.id);
    setForm(toFormState(entry));
    setFieldErrors({});
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setMessage(null);
  }

  async function handleDelete(entry: Experience) {
    setFailed(false);
    setMessage(null);

    try {
      const res = await fetch(`/api/experience/${entry.id}`, {
        method: "DELETE",
      });

      if (res.status === 204) {
        setEntries((current) =>
          current.filter((item) => item.id !== entry.id)
        );
        setMessage("Role deleted.");
        if (editingId === entry.id) {
          cancelEdit();
        }
        return;
      }

      if (res.status === 404) {
        setEntries((current) =>
          current.filter((item) => item.id !== entry.id)
        );
        setFailed(true);
        return;
      }

      setFailed(true);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div>
      {editingId ? (
        <p className="banner success" role="status">
          Editing a role — the entry keeps its id so existing links keep
          working.{" "}
          <button type="button" className="view-link" onClick={cancelEdit}>
            Cancel edit
          </button>
        </p>
      ) : null}
      {message ? (
        <p className="banner success" role="status">
          {message}
        </p>
      ) : null}
      {failed ? (
        <p className="banner error" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}

      <ExperienceForm
        form={form}
        fieldErrors={fieldErrors}
        sending={sending}
        editingId={editingId}
        onChange={setForm}
        onSubmit={handleSubmit}
        onCancel={cancelEdit}
      />

      <ExperienceAdminList
        entries={entries}
        loading={loading}
        onEdit={startEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
