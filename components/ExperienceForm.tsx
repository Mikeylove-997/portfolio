"use client";

import FieldError from "@/components/FieldError";
import { INDUSTRIES } from "@/lib/experience-shared";
import type { Industry } from "@/lib/experience-shared";

export type ExperienceFormState = {
  company: string;
  title: string;
  location: string;
  startDateText: string;
  endDateText: string;
  industry: Industry;
  highlightsText: string;
  skillsText: string;
};

export type ExperienceFieldErrors = {
  company?: string;
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  industry?: string;
  highlights?: string;
  skills?: string;
};

export default function ExperienceForm({
  form,
  fieldErrors,
  sending,
  editingId,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: ExperienceFormState;
  fieldErrors: ExperienceFieldErrors;
  sending: boolean;
  editingId: string | null;
  onChange: (next: ExperienceFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <div className="card form-card">
      <h2>{editingId ? "Edit Role" : "Add a New Role"}</h2>
      <form onSubmit={onSubmit} className="form" noValidate>
        <div className="field">
          <label htmlFor="experience-company">Company</label>
          <input
            id="experience-company"
            name="company"
            type="text"
            placeholder="BMO (Bank of Montreal)"
            value={form.company}
            onChange={(event) =>
              onChange({ ...form, company: event.target.value })
            }
          />
          <FieldError message={fieldErrors.company} />
        </div>
        <div className="field">
          <label htmlFor="experience-title">Title</label>
          <input
            id="experience-title"
            name="title"
            type="text"
            placeholder="Personal Banker"
            value={form.title}
            onChange={(event) =>
              onChange({ ...form, title: event.target.value })
            }
          />
          <FieldError message={fieldErrors.title} />
        </div>
        <div className="field">
          <label htmlFor="experience-location">Location</label>
          <input
            id="experience-location"
            name="location"
            type="text"
            placeholder="Toronto, Canada"
            value={form.location}
            onChange={(event) =>
              onChange({ ...form, location: event.target.value })
            }
          />
          <FieldError message={fieldErrors.location} />
        </div>
        <div className="field">
          <label htmlFor="experience-industry">Industry</label>
          <select
            id="experience-industry"
            name="industry"
            value={form.industry}
            onChange={(event) =>
              onChange({
                ...form,
                industry: event.target.value as Industry,
              })
            }
          >
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          <FieldError message={fieldErrors.industry} />
        </div>
        <div className="field">
          <label htmlFor="experience-start-date">Start Date</label>
          <input
            id="experience-start-date"
            name="startDate"
            type="month"
            value={form.startDateText}
            onChange={(event) =>
              onChange({ ...form, startDateText: event.target.value })
            }
          />
          <FieldError message={fieldErrors.startDate} />
        </div>
        <div className="field">
          <label htmlFor="experience-end-date">
            End Date (empty = current role)
          </label>
          <input
            id="experience-end-date"
            name="endDate"
            type="month"
            value={form.endDateText}
            onChange={(event) =>
              onChange({ ...form, endDateText: event.target.value })
            }
          />
          <FieldError message={fieldErrors.endDate} />
        </div>
        <div className="field">
          <label htmlFor="experience-highlights">Highlights (one per line)</label>
          <textarea
            id="experience-highlights"
            name="highlights"
            rows={4}
            placeholder={"Advised clients on day-to-day banking\nBuilt spreadsheets the branch still uses"}
            value={form.highlightsText}
            onChange={(event) =>
              onChange({ ...form, highlightsText: event.target.value })
            }
          />
          <FieldError message={fieldErrors.highlights} />
        </div>
        <div className="field">
          <label htmlFor="experience-skills">Skills (one per line)</label>
          <textarea
            id="experience-skills"
            name="skills"
            rows={4}
            placeholder={"Client advisory\nFinancial analysis"}
            value={form.skillsText}
            onChange={(event) =>
              onChange({ ...form, skillsText: event.target.value })
            }
          />
          <FieldError message={fieldErrors.skills} />
        </div>
        <button type="submit" disabled={sending}>
          {sending
            ? "Saving..."
            : editingId
              ? "Save Changes"
              : "Add Role"}
        </button>
        {editingId ? (
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel edit
          </button>
        ) : null}
      </form>
    </div>
  );
}
