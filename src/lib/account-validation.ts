export const ACCOUNT_CATEGORIES = ["STUDENT", "TRADER", "GEMOLOGIST", "PROFESSIONAL"] as const;
export type AccountField = "name" | "email" | "password" | "confirmPassword" | "category";
export type AccountErrors = Partial<Record<AccountField, string>>;

export function validateAccount(values: Record<string, unknown>): AccountErrors {
  const errors: AccountErrors = {};
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";
  const password = typeof values.password === "string" ? values.password : "";
  const confirmation = typeof values.confirmPassword === "string" ? values.confirmPassword : "";
  if (name.length < 2 || name.length > 100) errors.name = "Enter a name with 2–100 characters.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";
  if (password.length < 12) errors.password = "Use at least 12 characters.";
  else if (!/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) errors.password = "Include at least one number and one symbol.";
  if (!confirmation) errors.confirmPassword = "Confirm your password.";
  else if (confirmation !== password) errors.confirmPassword = "Passwords do not match.";
  if (typeof values.category !== "string" || !ACCOUNT_CATEGORIES.includes(values.category.trim().toUpperCase() as (typeof ACCOUNT_CATEGORIES)[number])) {
    errors.category = "Choose a user category.";
  }
  return errors;
}
