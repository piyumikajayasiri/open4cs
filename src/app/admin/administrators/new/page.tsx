import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AccountForm from "@/components/account/AccountForm";

export default async function AddAdministratorPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");
  return <main className="p-6"><AccountForm mode="admin" /></main>;
}
