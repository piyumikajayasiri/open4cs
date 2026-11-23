"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
  };
};

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <AdminSidebar pathname={pathname} user={user} />

      <div className="flex min-h-screen flex-col pl-64">
        <main className="flex-1">{children}</main>

        <AdminFooter />
      </div>
    </div>
  );
}
