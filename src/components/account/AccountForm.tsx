"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ACCOUNT_CATEGORIES, validateAccount, type AccountErrors, type AccountField } from "@/lib/account-validation";

type Mode = "register" | "user" | "admin";
const labels: Record<AccountField, string> = { name: "Full name", email: "Email address", password: "Password", confirmPassword: "Confirm password", category: "User category" };
const titles = { register: "Create your account", user: "Add user", admin: "Add administrator" };

export default function AccountForm({ mode }: { mode: Mode }) {
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "", category: mode === "admin" ? "PROFESSIONAL" : "STUDENT" });
  const [errors, setErrors] = useState<AccountErrors>({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempted, setAttempted] = useState(false);

  function update(field: AccountField, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (attempted) setErrors(validateAccount(next));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || success) return;
    setAttempted(true);
    setMessage("");
    const nextErrors = validateAccount(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(`account-${Object.keys(nextErrors)[0]}`)?.focus();
      return;
    }
    setSaving(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : mode === "admin" ? "/api/admin/administrators" : "/api/admin/users";
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role: mode === "admin" ? "ADMIN" : "USER", status: "ACTIVE" }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors || (response.status === 409 ? { email: data.message } : {}));
        setMessage(data.message || "Unable to create the account. Please try again.");
        return;
      }
      setSuccess(true);
      setValues((previous) => ({ ...previous, password: "", confirmPassword: "" }));
      setMessage(mode === "register" ? "Your account is ready. Sign in with your email and password." : `${mode === "admin" ? "Administrator" : "User"} account created successfully.`);
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold">{titles[mode]}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{mode === "admin" ? "Create an account with access to user management and system administration." : "Enter the account details below. All fields are required."}</p>
      {success ? <div role="status" className="mt-6 space-y-4">
        <p className="rounded-lg bg-emerald-50 p-4 text-emerald-800">{message}</p>
        <Link className="font-medium text-blue-700 underline" href={mode === "register" ? "/login" : "/admin/users"}>{mode === "register" ? "Continue to sign in" : "View accounts"}</Link>
        {mode !== "register" && <Button type="button" variant="outline" className="ml-4" onClick={() => {
          setSuccess(false); setMessage(""); setAttempted(false); setErrors({});
          setValues({ name: "", email: "", password: "", confirmPassword: "", category: mode === "admin" ? "PROFESSIONAL" : "STUDENT" });
        }}>Add another</Button>}
      </div> : <form noValidate onSubmit={submit} className="mt-6 space-y-5">
        <fieldset disabled={saving} className="space-y-5">
          <legend className="sr-only">Account details</legend>
          {(["name", "email", "password", "confirmPassword"] as const).map((field) => <div key={field} className="space-y-2">
            <label htmlFor={`account-${field}`} className="text-sm font-medium">{labels[field]}</label>
            <Input id={`account-${field}`} name={field} required value={values[field]}
              type={field === "email" ? "email" : field.toLowerCase().includes("password") && !showPassword ? "password" : "text"}
              autoComplete={field === "name" ? "name" : field === "email" ? "email" : "new-password"}
              maxLength={field === "name" ? 100 : field === "email" ? 254 : undefined}
              className="h-11" aria-invalid={Boolean(errors[field])}
              aria-describedby={errors[field] ? `account-${field}-error` : field === "password" ? "password-help" : undefined}
              onChange={(event) => update(field, event.target.value)}
              onBlur={() => setErrors((previous) => ({ ...previous, [field]: validateAccount(values)[field] }))} />
            {field === "password" && <p id="password-help" className="text-xs text-muted-foreground">Use at least 12 characters, including a number and a symbol.</p>}
            {errors[field] && <p id={`account-${field}-error`} role="alert" className="text-sm text-destructive">{errors[field]}</p>}
          </div>)}
          <Button type="button" variant="outline" size="sm" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide passwords" : "Show passwords"}</Button>
          <fieldset aria-describedby={errors.category ? "account-category-error" : undefined}>
            <legend id="account-category" className="mb-2 text-sm font-medium">User category</legend>
            <div className="grid grid-cols-2 gap-2">
              {ACCOUNT_CATEGORIES.map((category) => <Button key={category} type="button" variant={values.category === category ? "default" : "outline"} aria-pressed={values.category === category} onClick={() => update("category", category)}>{category.charAt(0) + category.slice(1).toLowerCase()}</Button>)}
            </div>
            {errors.category && <p id="account-category-error" role="alert" className="mt-2 text-sm text-destructive">{errors.category}</p>}
          </fieldset>
          {message && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p>}
          <Button type="submit" className="h-11 w-full" disabled={saving}>{saving ? "Creating account..." : titles[mode]}</Button>
        </fieldset>
      </form>}
      {mode === "register" && !success && <p className="mt-5 text-sm text-muted-foreground">Already registered? <Link href="/login" className="text-blue-700 underline">Sign in</Link></p>}
    </section>
  );
}
