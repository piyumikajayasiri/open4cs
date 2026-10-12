import { auth } from "@/auth";
import { redirect } from "next/navigation";

import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // User is not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // User is logged in but is not an admin
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <AdminShell
      user={{
        name: session.user.name || "CAGS Admin",
        email: session.user.email || "admin@cags.lk",
      }}
    >
      {children}
    </AdminShell>
  );
}
