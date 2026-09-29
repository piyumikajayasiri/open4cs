import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Welcome, {session.user.name}</h1>

      <p className="mt-2 text-gray-600">Category: {session.user.category}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">New Evaluation</h2>
          <p className="mt-2 text-sm text-gray-600">Evaluate a gemstone.</p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">Evaluation History</h2>
          <p className="mt-2 text-sm text-gray-600">
            View previous evaluations.
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="font-semibold">Compare</h2>
          <p className="mt-2 text-sm text-gray-600">Compare gemstones.</p>
        </div>
      </div>
    </main>
  );
}
