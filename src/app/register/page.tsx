"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    category: "STUDENT",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: string, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-2 text-2xl font-bold">Create Account</h1>

        <p className="mb-6 text-sm text-gray-600">
          Create your Open 4Cs account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full rounded-lg border p-3"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />

          <input
            className="w-full rounded-lg border p-3"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />

          <input
            className="w-full rounded-lg border p-3"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
            minLength={8}
          />

          <select
            className="w-full rounded-lg border p-3"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            <option value="STUDENT">Student</option>
            <option value="TRADER">Trader</option>
            <option value="GEMOLOGIST">Gemologist</option>
            <option value="PROFESSIONAL">Professional</option>
          </select>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black p-3 text-white disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already have an account?{" "}
          <a href="/login" className="font-medium underline">
            Login
          </a>
        </p>
      </div>
    </main>
  );
}
