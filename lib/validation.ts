export type ContactInput = {
  name: string;
  email: string;
  message: string;
};

export type ContactFieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export type ContactValidationResult = {
  valid: boolean;
  errors: ContactFieldErrors;
};

export function validateContact(input: ContactInput): ContactValidationResult {
  const errors: ContactFieldErrors = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (!name) {
    errors.name = "Name is required.";
  }
  if (!message) {
    errors.message = "Message is required.";
  }

  const emailError = validateEmail(email);
  if (emailError) {
    errors.email = emailError;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateEmail(email: string): string | null {
  if (!email) {
    return "Email is required.";
  }
  if (/\s/.test(email)) {
    return "Email must not contain whitespace.";
  }
  const parts = email.split("@");
  if (parts.length !== 2) {
    return 'Email must contain exactly one "@".';
  }
  const [local, domain] = parts;
  if (!local) {
    return 'Email must have text before the "@".';
  }
  if (!domain.includes(".")) {
    return "Email domain must contain a dot.";
  }
  const labels = domain.split(".");
  if (labels.some((label) => label.length === 0)) {
    return "Email domain must not contain empty labels.";
  }
  return null;
}
