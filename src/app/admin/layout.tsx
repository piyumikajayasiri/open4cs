import { getCurrentUser } from "@/lib/auth/currentUser";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AdminShell
      user={{
        name: user?.name || "CAGS Admin",
        email: user?.email || "admin@cags.lk",
      }}
    >
      {children}
    </AdminShell>
  );
}
