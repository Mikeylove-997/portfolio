"use server";

import { getProjectBySlug } from "@/lib/projects";
import { validateContact } from "@/lib/validation";
import type { ContactFieldErrors } from "@/lib/validation";
import { addContact } from "@/lib/contacts";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  errors: ContactFieldErrors;
  values: { name: string; email: string; message: string };
  savedId: string | null;
};

export async function saveContactMessage(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const message = String(formData.get("message") ?? "");
  const projectParam = String(formData.get("project") ?? "").trim();

  const project =
    projectParam && getProjectBySlug(projectParam) ? projectParam : null;

  const { valid, errors } = validateContact({ name, email, message });
  if (!valid) {
    return {
      status: "error",
      errors,
      values: { name, email, message },
      savedId: null,
    };
  }

  const saved = await addContact({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    project,
  });

  return {
    status: "success",
    errors: {},
    values: { name: "", email: "", message: "" },
    savedId: saved.id,
  };
}
