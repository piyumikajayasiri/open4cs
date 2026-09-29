import { auth } from "@/auth";
import AdminShell from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <AdminShell
      user={{
        name: session?.user?.name || "CAGS Admin",
        email: session?.user?.email || "admin@cags.lk",
      }}
    >
      {children}
    </AdminShell>
  );
}
