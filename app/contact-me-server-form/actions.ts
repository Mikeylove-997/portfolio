"use server";

import { redirect } from "next/navigation";
import { getProjectBySlug } from "@/lib/projects";
import { validateContact } from "@/lib/validation";
import { addContact } from "@/lib/contacts";

export async function saveContactMessage(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const message = String(formData.get("message") ?? "");
  const projectParam = String(formData.get("project") ?? "").trim();

  const project =
    projectParam && getProjectBySlug(projectParam) ? projectParam : null;

  const { valid } = validateContact({ name, email, message });
  if (!valid) {
    redirect("/contact-me-server-form?status=error");
  }

  await addContact({
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
    project,
  });

  if (project) {
    redirect(`/projects/${project}?submitted=1`);
  }
  redirect("/contact-me-server-form?submitted=1");
}
