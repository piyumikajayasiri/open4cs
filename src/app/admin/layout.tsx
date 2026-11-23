import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/currentUser";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (user.role !== "CAGS_ADMIN") {
    redirect("/dashboard?error=admin_required");
  }

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
      }}
    >
      {children}
    </AdminShell>
  );
}
